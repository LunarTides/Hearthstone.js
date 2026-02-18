import { error, json } from "@sveltejs/kit";
import fs from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { join } from "path";
import { tmpdir } from "os";
import { db } from "$lib/server/db/index.js";
import type { Pack } from "$lib/db/schema.js";
import * as table from "$lib/db/schema.js";
import { eq, and, type InferInsertModel } from "drizzle-orm";
import semver from "semver";
import { getCategorySettings } from "$lib/server/db/setting.js";
import { censorPack } from "$lib/pack.js";
import { memberHasPermission } from "$lib/group.js";
import { setLatestVersion } from "$lib/server/db/pack.js";

interface Metadata {
	versions: {
		metadata: number;
		game: string;
		pack: string;
	};
	name: string;
	description: string;
	author: string;
	license: string;
	links: Record<string, string>;
	permissions: {
		network: boolean;
		fileSystem: boolean;
	};
	requires: {
		packs: string[];
		cards: string[];
		classes: string[];
		// TODO: Add tribes, etc...
	};
}

function parseCardField(content: string, name: string) {
	const split = content.split(`${name}: `);
	if (split.length <= 1) {
		return undefined;
	}

	let values = [split[1].split(",")[0]];
	const matches = values[0].matchAll(/[A-Z][a-z]*\.([A-Z][a-z]*)/g);

	const isArray = values[0].startsWith("[");
	if (isArray) {
		values = [];
	}

	for (const match of matches) {
		if (match.length <= 1) {
			continue;
		}

		if (name === "enchantmentPriority") {
			// TODO: Parse enchantment priority correctly.
		}

		const parsed = `"${match[1]}"`;

		if (isArray) {
			values.push(parsed);
		} else {
			values[0] = parsed;
		}
	}

	if (isArray) {
		return values.map((v) => JSON.parse(v));
	}

	return JSON.parse(values[0]);
}

// TODO: Use hemming distance on the pack name to prevent confusion.
export async function POST(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const username = event.params.username;
	const packName = event.params.packName;

	if (username !== user.username) {
		const result = await db
			.select()
			.from(table.group)
			.innerJoin(
				table.groupMember,
				and(
					eq(table.groupMember.groupName, table.group.username),
					eq(table.groupMember.username, user.username),
				),
			)
			.where(eq(table.group.username, username))
			.limit(1);
		if (!result) {
			return json(
				{ message: "You do not have permission to upload a pack for this user." },
				{ status: 403 },
			);
		}

		const { groupMember } = result[0];
		if (memberHasPermission(groupMember.permissions, "pack.upload")) {
			// The user can upload on behalf of that group.
		} else {
			return json(
				{ message: "You do not have permission to upload a pack for this user." },
				{ status: 403 },
			);
		}
	}

	const fileBytes = await event.request.arrayBuffer();
	const file = new File([fileBytes], `${username}+${packName}.tar.gz`);

	const settings = await getCategorySettings({
		upload: ["maxFileSize", "maxFileAmount", "allowedExtensions", "requireApproval"],
	});
	if (file.size > settings.upload.maxFileSize) {
		return json({ message: "Upload too large." }, { status: 413 });
	}

	const bytes = await file.bytes();
	const magic = Array.from(bytes.slice(0, 2) as Uint8Array)
		.map((v) => v.toString(16))
		.join(" ")
		.toUpperCase();

	// tar.gz magic byte. https://en.wikipedia.org/wiki/List_of_file_signatures
	if (magic !== "1F 8B") {
		return json({ message: "Invalid file type." }, { status: 415 });
	}

	// Double check.
	const ft = await fileTypeFromBuffer(bytes);
	if (ft === undefined || ft.ext !== "tar.gz" || ft.mime !== "application/gzip") {
		return json({ message: "Invalid file type." }, { status: 415 });
	}

	// Isolate temporarily.
	const tmpPath = await fs.mkdtemp(join(tmpdir(), "pack-"));

	// Get the
	const archive = new Bun.Archive(bytes);

	const files = Array.from((await archive.files()).values());
	if (files.length > settings.upload.maxFileAmount) {
		return json({ message: "Too many files in archive." }, { status: 413 });
	}

	const uncompressedSize = files.map((f) => f.size).reduce((p, c) => p + c, 0);
	if (uncompressedSize > settings.upload.maxFileSize) {
		return json({ message: "Upload too large." }, { status: 413 });
	}

	// Prevent path traversal.
	let metadataFile = undefined;

	for (const file of files) {
		if (
			!settings.upload.allowedExtensions.some((ext: string) => file.name.endsWith(ext)) &&
			// Allow directories.
			/\../.test(file.name)
		) {
			return json({ message: "Archive contains illegal file types." }, { status: 400 });
		}

		if (file.name.endsWith("pack.json5")) {
			metadataFile = file;
		}
	}

	if (!metadataFile) {
		return json({ message: "'pack.json5' not found." }, { status: 400 });
	}

	// TODO: Only allow alphanumeric characters and _ in pack names.
	// TODO: Check for username + packName conflicts.

	await archive.extract(tmpPath);

	try {
		const folderStats = await fs.stat(tmpPath);
		if (!folderStats.isDirectory()) {
			return json({ message: "Archive invalid." }, { status: 400 });
		}
	} catch (err: any) {
		// Folder not found.
		if (err?.code === "ENOENT") {
			return json({ message: "Archive invalid." }, { status: 400 });
		}
	}

	const metadataContent = await metadataFile.text();

	// TODO: Parse via zod.
	// TODO: Reject proprietary packs.
	const metadata = Bun.JSON5.parse(metadataContent) as Metadata;

	if (!semver.valid(metadata.versions.pack)) {
		error(400, "Invalid pack version.");
	}

	// TODO: Delete pack from db if adding cards goes wrong.
	const pack: Pack[] = await db
		.insert(table.pack)
		.values({
			ownerName: username,
			name: packName,
			metadataVersion: metadata.versions.metadata,
			gameVersion: metadata.versions.game,
			packVersion: metadata.versions.pack,
			description: metadata.description,
			author: metadata.author,
			license: metadata.license,
			permissions: Object.entries(metadata.permissions)
				.filter(([_, value]) => Boolean(value))
				.map(([key]) => key),

			unpackedSize: uncompressedSize,

			isLatestVersion: false,
			approved: !settings.upload.requireApproval,
		})
		.returning();

	// Parse cards.
	for (const file of files) {
		if (!file.name.endsWith(".ts")) {
			continue;
		}

		const abilityRegex = /\tasync (\w+).*? {/g;
		const content = await file.text();

		const abilities = [];
		for (const match of content.matchAll(abilityRegex)) {
			if (match.length <= 1) {
				continue;
			}

			const ability = match[1];
			abilities.push(ability);
		}

		const filePath = file.name.replaceAll("\\", "/");

		const f = parseCardField.bind(null, content);
		const card: InferInsertModel<typeof table.card> = {
			uuid: f("id"),
			abilities,
			packId: pack[0].id,

			name: f("name"),
			text: f("text"),
			cost: f("cost"),
			type: f("type"),
			classes: f("classes"),
			rarity: f("rarity"),
			collectible: f("collectible"),
			tags: f("tags"),

			attack: f("attack"),
			health: f("health"),
			tribes: f("tribes"),

			spellSchools: f("spellSchools"),

			durability: f("durability"),
			cooldown: f("cooldown"),

			armor: f("armor"),
			heropowerId: f("heropowerId"),

			enchantmentPriority: f("enchantmentPriority"),

			approved: !settings.upload.requireApproval,
			isLatestVersion: false,
			filePath,
		};

		// TODO: Validate c using zod.

		await db.insert(table.card).values(card);
	}

	await setLatestVersion(username, packName);

	// TODO: Add links.
	const id = pack[0].id;

	// TODO: Check if this is safe.
	const finalPath = `./static/assets/packs/${username}/${packName}/${metadata.versions.pack}/${id}`;
	await fs.mkdir(finalPath, { recursive: true });

	await fs.cp(tmpPath, finalPath, { recursive: true });
	await fs.rm(tmpPath, { recursive: true, force: true });

	// TODO: Include link.
	return json({ pack: censorPack(pack[0], user) }, { status: 201 });
}
