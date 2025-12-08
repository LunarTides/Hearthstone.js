import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import seven from "7zip-min";
import { fileTypeFromBuffer } from "file-type";
import { join, resolve } from "path";
import { tmpdir } from "os";
import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { card, pack } from "$lib/server/db/schema.js";
import type { InferInsertModel } from "drizzle-orm";

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

export const actions = {
	default: async (event) => {
		const user = event.locals.user;
		if (!user) {
			error(401, { message: m.login_required() });
		}

		const formData = await event.request.formData();
		const file = formData.get("file");
		if (!file) {
			error(422, { message: m.supply_file() });
		}

		if (!(file instanceof File)) {
			error(422, { message: m.invalid_file() });
		}

		if (file.type !== "application/x-7z-compressed") {
			error(415, { message: m.invalid_file_type() });
		}

		// TODO: Move to settings.
		if (file.size > 100 * 1024 * 1024) {
			error(413, { message: m.upload_too_large() });
		}

		const bytes = await file.bytes();
		const magic = Array.from(bytes.slice(0, 6) as Uint8Array)
			.map((v) => v.toString(16))
			.join(" ")
			.toUpperCase();

		// 7z magic byte.
		if (magic !== "37 7A BC AF 27 1C") {
			error(415, { message: m.invalid_file_type() });
		}

		// Double check.
		const ft = await fileTypeFromBuffer(bytes);
		if (ft === undefined || ft.ext !== "7z" || ft.mime !== "application/x-7z-compressed") {
			error(415, { message: m.invalid_file_type() });
		}

		// Isolate temporarily.
		const tmpPath = await fs.mkdtemp(join(tmpdir(), "pack-"));
		const compressedPath = `${tmpPath}/pack.7z`;
		await fs.writeFile(compressedPath, bytes);

		const files = await seven.list(compressedPath);
		// TODO: Move to settings.
		if (files.length > 5000) {
			error(413, { message: m.archive_too_many_files() });
		}

		const uncompressedSize = files.map((f) => parseInt(f.size, 10)).reduce((p, c) => p + c, 0);
		// TODO: Move to settings.
		if (uncompressedSize > 100 * 1024 * 1024) {
			error(413, { message: m.upload_too_large() });
		}

		// TODO: Move to settings.
		const allowedExtensions = [".ts", ".jsonc", ".md"];

		// Prevent path traversal.
		let hasMeta = false;

		for (const file of files) {
			const target = resolve(tmpPath, file.name);
			if (!target.startsWith(tmpPath)) {
				console.log(1);
				error(400, { message: m.archive_invalid() });
			}

			// Allow directories.
			if (!allowedExtensions.some((ext) => file.name.endsWith(ext)) && /\../.test(file.name)) {
				error(400, { message: m.archive_illegal_file_types() });
			}

			if (file.name.endsWith("meta.jsonc")) {
				hasMeta = true;
			}
		}

		if (!hasMeta) {
			error(400, { message: m.meta_not_found() });
		}

		// TODO: This could maybe create symlinks, which would be bad?
		// TODO: Guard against zip bombs. `ulimit -f`
		// await seven.unpack(tmpPackPath, tmpDirPath);
		await seven.cmd(["x", "-snl", "-y", compressedPath, "-o" + tmpPath]);

		const folderName = file.name.split(".").slice(0, -1).join(".");
		const innerFolderPath = resolve(tmpPath, folderName);

		try {
			const folderStats = await fs.stat(innerFolderPath);
			if (!folderStats.isDirectory()) {
				console.log(2);
				error(400, { message: m.archive_invalid() });
			}
		} catch (err: any) {
			// Folder not found.
			if (err?.code === "ENOENT") {
				console.log(3);
				error(400, { message: m.archive_invalid() });
			}
		}

		// TODO: Parse meta file.
		const metadataContent = await fs.readFile(`${innerFolderPath}/meta.jsonc`, "utf8");

		// TODO: Make sure this works.
		// TODO: Parse via zod.
		// TODO: Reject proprietary packs.
		const metadata: Metadata = JSON.parse(metadataContent);

		// TODO: Delete pack from db if adding cards goes wrong.
		await db.insert(pack).values({
			uuid: folderName,
			userId: user.id,
			metadataVersion: metadata.versions.metadata,
			gameVersion: metadata.versions.game,
			packVersion: metadata.versions.pack,
			name: metadata.name,
			description: metadata.description,
			license: metadata.license,
			authors: metadata.authors,

			// TODO: Add setting for this.
			approved: false,
		});

		// Parse cards.
		for (const file of files) {
			if (!file.name.endsWith(".ts")) {
				continue;
			}

			const abilityRegex = /\tasync (\w+).*? {/g;

			const content = await fs.readFile(resolve(tmpPath, file.name), "utf8");

			const abilities = [];
			for (const match of content.matchAll(abilityRegex)) {
				if (match.length <= 1) {
					continue;
				}

				const ability = match[1];
				abilities.push(ability);
			}

			const p = parseCardField.bind(null, content);
			const c: InferInsertModel<typeof card> = {
				uuid: p("id"),
				abilities,
				packUUID: folderName,

				name: p("name"),
				text: p("text"),
				cost: p("cost"),
				type: p("type"),
				classes: p("classes"),
				rarity: p("rarity"),
				collectible: p("collectible"),
				tags: p("tags"),

				attack: p("attack"),
				health: p("health"),
				tribes: p("tribes"),

				spellSchools: p("spellSchools"),

				durability: p("durability"),
				cooldown: p("cooldown"),

				armor: p("armor"),
				heropowerId: p("heropowerId"),

				enchantmentPriority: p("enchantmentPriority"),
			};

			// TODO: Validate c using zod.

			await db.insert(card).values(c);
		}

		// TODO: Add links.

		const finalPath = `./static/assets/held/packs/${file.name.split(".").slice(0, -1).join(".")}`;

		await fs.cp(innerFolderPath, finalPath, { recursive: true });
		await fs.rm(innerFolderPath, { recursive: true, force: true });
	},
};
