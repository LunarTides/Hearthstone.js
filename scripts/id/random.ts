/**
 * A collection of functions relating to reading and writing ids of blueprints.
 */

import { randomUUID } from "node:crypto";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import { resolve } from "node:path";
import lodash from "lodash";

const idRegex = /id: (\d+)/;

async function searchFolder(
	path: string,
	callback: (
		index: number,
		path: string,
		file: Dirent<string>,
		fileContent?: string,
	) => Promise<void>,
): Promise<void> {
	// Native readdir due to node 24 bs.
	const files = await fs.readdir(path, {
		encoding: "utf8",
		withFileTypes: true,
		recursive: true,
	});

	// Use Promise.all to read all the files in parallel
	await Promise.all(
		files.map(async (file, i) => {
			const fullPath = resolve(path, file.parentPath, file.name);
			let fileContent: string | undefined;

			if (file.isFile()) {
				fileContent = await fs.readFile(fullPath, "utf8");
			}

			return await callback(i, fullPath, file, fileContent);
		}),
	);
}

async function searchCardsFolder(
	callback: (
		path: string,
		content: string,
		file: Dirent<string>,
		index: number,
	) => Promise<void>,
	path = "/home/lunar/Documents/Programming/Hearthstone.js/cards",
	extension = ".ts",
): Promise<void> {
	await searchFolder(path, async (index, fullPath, file, fileContent) => {
		if (
			fileContent &&
			file.isFile() &&
			file.name.endsWith(extension) &&
			!file.name.startsWith("ids")
		) {
			return await callback(fullPath, fileContent, file, index);
		}
	});
}

export async function random() {
	await searchCardsFolder(async (path, content) => {
		const idMatch = idRegex.exec(content);
		if (!idMatch) {
			console.error(`No id found in ${path}`);
			return;
		}

		const uuid = randomUUID();
		await fs.writeFile(path, content.replace(idRegex, `id: "${uuid}"`));
	});
}

async function generateIdsFile(): Promise<void> {
	let idsContent =
		"// This file has been automatically generated. Do not change this file.\n\n";
	idsContent += "export const cardIds = {\n";
	idsContent += '\tnull: "00000000-0000-0000-0000-000000000000",';

	const cards: { name: string; id: string }[] = [];
	await searchCardsFolder(async (path, content) => {
		const card = { name: "", id: "" };
		card.name = content.split('name: "')[1].split('",')[0];
		card.id = content.split('id: "')[1].split('",')[0];
		cards.push(card);
	});

	for (const card of cards.sort((a, b) => a.id.localeCompare(b.id))) {
		const numberIdentifier = /^\d/.test(card.name) ? "n" : "";
		idsContent += `\n\t${numberIdentifier}${lodash.camelCase(card.name)}_${card.id.replaceAll("-", "_")}: "${card.id}",`;
	}

	idsContent += "\n};\n";

	await fs.writeFile(
		"/home/lunar/Documents/Programming/Hearthstone.js/cards/ids.ts",
		idsContent,
	);
}

await generateIdsFile();
