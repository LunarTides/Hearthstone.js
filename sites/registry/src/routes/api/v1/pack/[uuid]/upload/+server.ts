import { error, json } from "@sveltejs/kit";
import fs from "fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { join } from "path";
import { tmpdir } from "os";
import { db } from "$lib/server/db/index.js";
import type { Pack } from "$lib/db/schema.js";
import * as table from "$lib/db/schema.js";
import type { InferInsertModel } from "drizzle-orm";
import semver from "semver";
import { getCategorySettings } from "$lib/server/db/setting.js";
import { censorPack } from "$lib/pack.js";
import { setLatestVersion } from "$lib/server/db/pack.js";

interface Metadata {
	versions: {
		metadata: number;
		game: string;
		pack: string;
	};
	name: string;
	description: string;
	license: string;
	authors: string[];
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

export async function POST(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const uuid = event.params.uuid;
	const fileBytes = await event.request.arrayBuffer();
	const file = new File([fileBytes], uuid);

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
	const compressedPath = `${tmpPath}/pack.tar.gz`;
	await fs.writeFile(compressedPath, bytes);

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
	let hasMeta = false;

	for (const file of files) {
		if (
			!settings.upload.allowedExtensions.some((ext: string) => file.name.endsWith(ext)) &&
			// Allow directories.
			/\../.test(file.name)
		) {
			return json({ message: "Archive contains illegal file types." }, { status: 400 });
		}

		if (file.name.endsWith("meta.jsonc")) {
			hasMeta = true;
		}
	}

	if (!hasMeta) {
		return json({ message: "'meta.jsonc' not found." }, { status: 400 });
	}

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

	const metadataContent = await fs.readFile(`${tmpPath}/meta.jsonc`, "utf8");

	// TODO: Parse via zod.
	// TODO: Reject proprietary packs.
	const metadata: Metadata = JSON.parse(metadataContent);

	if (!semver.valid(metadata.versions.pack)) {
		error(400, "Invalid pack version.");
	}

	// Check if a pack with that name / uuid already exists,
	// if it does, and the current user is one of that pack's authors, update it.
	// let isLatestVersion = true;
	// let update = false;
	const updateDB = async (values: InferInsertModel<typeof table.pack>) =>
		db.insert(table.pack).values(values).returning();

	// const otherVersions = await db
	// 	.select()
	// 	.from(table.pack)
	// 	.where(or(eq(table.pack.uuid, uuid), eq(table.pack.name, metadata.name)));
	// for (const version of otherVersions) {
	// if (semver.eq(metadata.versions.pack, version.packVersion)) {
	// 	// TODO: Add ability for the uploader to limit who can edit the pack.
	// 	if (version.userIds.includes(user.id)) {
	// 		// Override.
	// 		updateDB = async (values: InferInsertModel<typeof pack>) =>
	// 			db.update(pack).set(values).where(eq(pack.id, version.id)).returning();
	// 		// // update = true;
	// 	} else {
	// 		// No permission.
	// 		error(403, "You do not have permission to edit this pack.");
	// 	}
	// }
	// }

	// TODO: Delete pack from db if adding cards goes wrong.
	const pack: Pack[] = await updateDB({
		uuid,
		userIds: [user.id],
		metadataVersion: metadata.versions.metadata,
		gameVersion: metadata.versions.game,
		packVersion: metadata.versions.pack,
		name: metadata.name,
		description: metadata.description,
		license: metadata.license,
		authors: metadata.authors,
		permissions: Object.entries(metadata.permissions)
			.filter(([_, value]) => Boolean(value))
			.map(([key]) => key),

		unpackedSize: uncompressedSize,

		isLatestVersion: false,
		approved: !settings.upload.requireApproval,
	});

	// Parse cards.
	for (const file of files) {
		if (!file.name.endsWith(".ts")) {
			continue;
		}

		const abilityRegex = /\tasync (\w+).*? {/g;

		const content = await fs.readFile(`${tmpPath}${file.name}`, "utf8");

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

	await setLatestVersion(uuid);

	// TODO: Add links.
	const id = pack[0].id;

	const finalPath = `./static/assets/packs/${uuid}/${metadata.versions.pack}/${id}`;
	await fs.mkdir(finalPath, { recursive: true });

	await fs.rm(compressedPath);
	await fs.cp(tmpPath, finalPath, { recursive: true });
	await fs.rm(tmpPath, { recursive: true, force: true });

	// TODO: Include link.
	return json({ pack: censorPack(pack[0], user) }, { status: 201 });
}
