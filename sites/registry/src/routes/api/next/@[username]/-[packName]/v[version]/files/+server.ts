import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import fs from "node:fs/promises";
import { resolve } from "path";
import type { FileTree } from "$lib/api/types.js";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

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

	const username = event.params.username;
	const packName = event.params.packName;
	const packVersion = event.params.version;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, packVersion),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved && !(await isUserMemberOfGroup(user, user?.username, username))) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	// TODO: Make sure this is safe.
	const folder = `./static/assets/packs/${pack.ownerName}/${pack.name}/${pack.packVersion}/${pack.id}`;

	// TODO: Validate. Make sure the path isn't too long, etc...
	const tree = await getTree(folder);

	return json(tree);
}
