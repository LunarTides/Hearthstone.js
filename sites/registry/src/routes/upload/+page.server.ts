import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import seven from "7zip-min";
import { fileTypeFromBuffer } from "file-type";
import { join, resolve } from "path";
import { tmpdir } from "os";

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
			error(415, { message: "Invalid file type." });
		}

		// TODO: Move to settings.
		if (file.size > 100 * 1024 * 1024) {
			error(413, { message: "Upload too large." });
		}

		const bytes = await file.bytes();
		const magic = Array.from(bytes.slice(0, 6) as Uint8Array)
			.map((v) => v.toString(16))
			.join(" ")
			.toUpperCase();

		// 7z magic byte.
		if (magic !== "37 7A BC AF 27 1C") {
			error(415, { message: "Invalid file type." });
		}

		// Double check.
		const ft = await fileTypeFromBuffer(bytes);
		if (ft === undefined || ft.ext !== "7z" || ft.mime !== "application/x-7z-compressed") {
			error(415, { message: "Invalid file type." });
		}

		// Isolate temporarily.
		const tmpDirPath = await fs.mkdtemp(join(tmpdir(), "pack-"));
		const tmpPackPath = `${tmpDirPath}/pack.7z`;
		await fs.writeFile(tmpPackPath, bytes);

		const files = await seven.list(tmpPackPath);

		const uncompressedSize = files.map((f) => parseInt(f.size, 10)).reduce((p, c) => p + c, 0);
		// TODO: Move to settings.
		if (uncompressedSize > 100 * 1024 * 1024) {
			error(413, { message: "Upload too large." });
		}

		// TODO: Move to settings.
		const allowedExtensions = [".ts", ".jsonc", ".md"];

		// Prevent path traversal.
		let hasMeta = false;

		for (const file of files) {
			const target = resolve(tmpDirPath, file.name);
			if (!target.startsWith(tmpDirPath)) {
				console.log(1);
				error(400, { message: "Archive invalid." });
			}

			if (!allowedExtensions.some((ext) => file.name.endsWith(ext)) && /\../.test(file.name)) {
				error(400, { message: "Archive contains illegal file types." });
			}

			if (file.name.endsWith("meta.jsonc")) {
				hasMeta = true;
			}
		}

		if (!hasMeta) {
			error(400, { message: "'meta.jsonc' not found." });
		}

		await seven.unpack(tmpPackPath, tmpDirPath);

		const folderName = file.name.split(".").slice(0, -1).join(".");
		// if (!await fs.exists(resolve(tmpDirPath, folderName))) {
		// 	error(400, { message: "Archive invalid." });
		// }

		try {
			const folderStats = await fs.stat(resolve(tmpDirPath, folderName));
			if (!folderStats.isDirectory()) {
				console.log(2);
				error(400, { message: "Archive invalid." });
			}
		} catch (err: any) {
			// Folder not found.
			if (err?.code === "ENOENT") {
				console.log(3);
				error(400, { message: "Archive invalid." });
			}
		}

		// TODO: Parse meta file.

		const finalPath = `./static/assets/held/packs/${file.name.split(".").slice(0, -1).join(".")}`;
		// if (!await fs.exists(finalPath)) {
		// 	await fs.mkdir(finalPath, { recursive: true });
		// }

		await seven.unpack(tmpPackPath, finalPath);
		await fs.rm(tmpPackPath, { recursive: true, force: true });

		// TODO: Copy metadata to metadatas folder.
	},
};
