import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import seven from "7zip-min";
import { fileTypeFromBuffer } from "file-type";
import { join, resolve } from "path";
import { tmpdir } from "os";
import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack } from "$lib/server/db/schema.js";

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

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const file = formData.get("file");
		if (!file) {
			return;
		}

		if (!(file instanceof File)) {
			return;
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
		const tmpDirPath = await fs.mkdtemp(join(tmpdir(), "pack-"));
		const tmpPackPath = `${tmpDirPath}/pack.7z`;
		await fs.writeFile(tmpPackPath, bytes);

		const files = await seven.list(tmpPackPath);
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
			const target = resolve(tmpDirPath, file.name);
			if (!target.startsWith(tmpDirPath)) {
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
		await seven.cmd(["x", "-snl", "-y", tmpPackPath, "-o" + tmpDirPath]);

		const folderName = file.name.split(".").slice(0, -1).join(".");
		const packPath = resolve(tmpDirPath, folderName);

		try {
			const folderStats = await fs.stat(packPath);
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
		const metadataContent = await fs.readFile(`${packPath}/meta.jsonc`, "utf8");

		// TODO: Make sure this works.
		// TODO: Parse via zod.
		const metadata: Metadata = JSON.parse(metadataContent);

		await db.insert(pack).values({
			uuid: folderName,
			// TODO: Change this.
			userId: "b4tm4c3oqlsmm6ffojogrdid",
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

		// TODO: Add links.
		// TODO: Parse cards.

		const finalPath = `./static/assets/held/packs/${file.name.split(".").slice(0, -1).join(".")}`;

		await fs.cp(packPath, finalPath, { recursive: true });
		await fs.rm(packPath, { recursive: true, force: true });
	},
};
