import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import fs from "fs/promises";
import { resolve } from "path";
import { satisfiesRole } from "$lib/user";
import type { FileTree } from "$lib/api/types.js";

async function getTree(path: string, parent?: string) {
	const files = await fs.readdir(path, { withFileTypes: true });
	const returnValue: FileTree[] = [];

	for (const file of files) {
		const path = `${parent ? `${parent}/` : ""}${file.name}`;

		if (file.isDirectory()) {
			returnValue.push({
				path,
				type: "directory",
				children: await getTree(resolve(file.parentPath, file.name), file.name),
			});
			continue;
		}

		returnValue.push({
			path,
			type: "file",
		});
	}

	return returnValue;
}

// TODO: Prevent this api from being spammed by the client.
export async function GET(event) {
	const user = event.locals.user;

	const uuid = event.params.uuid;
	const packVersion = event.params.version;
	const id = event.params.id;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.uuid, uuid),
					eq(table.pack.packVersion, packVersion),
					eq(table.pack.id, id),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved) {
		// eslint-disable-next-line no-empty
		if (user && (pack.userIds.includes(user.id) || satisfiesRole(user, "Moderator"))) {
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const folder = `./static/assets/packs/${pack.uuid}/${pack.packVersion}/${pack.id}`;

	// TODO: Validate. Make sure the path isn't too long, etc...
	const tree = await getTree(folder);

	return json(tree);
}
