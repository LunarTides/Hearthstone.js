/**
 * A collection of functions relating to reading and writing ids of blueprints.
 */

import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import { resolve } from "node:path";

const idRegex = /id: "([0-9a-z-]+)"/;

async function searchFolder(
	callback: (
		path: string,
		content: string,
		file: Dirent<string>,
		index: number,
	) => Promise<void>,
	path = "/home/lunar/Documents/Programming/Hearthstone.js/cards",
): Promise<void> {
	// Native readdir due to node 24 bs.
	const files = await fs.readdir(path, {
		encoding: "utf8",
		withFileTypes: true,
		recursive: true,
	});

	// Use Promise.all to read all the files in parallel
	await Promise.all(
		files
			.filter(
				(file) =>
					file.isFile() &&
					file.name.endsWith(".ts") &&
					!file.name.startsWith("ids"),
			)
			.map(async (file, i) => {
				const fullPath = resolve(path, file.parentPath, file.name);
				const fileContent = await fs.readFile(fullPath, "utf8");
				return await callback(fullPath, fileContent, file, i);
			}),
	);
}

export async function random() {
	const data: { oldPath: string; newPath: string; content: string }[] = [];

	await searchFolder(async (path, content) => {
		if (path.includes("Examples")) {
			return;
		}

		const idMatch = idRegex.exec(content);
		if (!idMatch) {
			console.error(`No id found in ${path}`);
			return;
		}

		const name = path
			.replace(/\d-Cost/, "")
			.split("-")
			.slice(1)
			.join("-")
			.split(".ts")[0];
		const p = path.split("/").slice(0, -1).join("/");

		const uuid = idMatch[1];
		data.push({
			content,
			oldPath: path,
			newPath: `${p}/${name}-${uuid.slice(0, 8)}.ts`,
		});
	});

	for (const file of data) {
		await fs.writeFile(file.newPath, file.content);
		await fs.rm(file.oldPath);
	}
}

await random();
