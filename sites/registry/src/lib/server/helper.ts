import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import type { InferInsertModel } from "drizzle-orm";
import type { RequestEvent } from "@sveltejs/kit";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import { resolve } from "node:path";

export async function notify(
	event: RequestEvent,
	values: InferInsertModel<typeof table.notification>,
) {
	await db.insert(table.notification).values({
		...values,
		route:
			values.route &&
			`${event.url.origin}/registry/${values.route.replaceAll("../", "").replaceAll("..", "")}`,
	});
}

/**
 * Reursively calls `callback` on all files / folders in the specified path.
 *
 * @param path The path to search in.
 * @param callback The callback to run on the files / folders.
 * @param [readFiles=true] If it should read the content of files, and return them in the callback function. Disable for optimization.
 */
export async function searchFolder(
	path: string,
	callback: (
		index: number,
		path: string,
		file: Dirent<string>,
		fileContent?: string,
	) => Promise<void>,
	readFiles = true,
	useFullPath = true,
): Promise<void> {
	// NOTE: Copied from Hearthstone.js
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

			const pathToUse = useFullPath ? fullPath : resolve(file.parentPath, file.name);

			if (readFiles && file.isFile()) {
				fileContent = (await fs.readFile(pathToUse, "utf8")) as string;
			}

			return await callback(i, pathToUse, file, fileContent);
		}),
	);
}
