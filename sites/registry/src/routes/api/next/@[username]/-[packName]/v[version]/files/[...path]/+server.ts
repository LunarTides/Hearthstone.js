import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import fs from "node:fs/promises";
import { resolve } from "path";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

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

	// TODO: Validate. Make sure the path isn't too long, etc...
	const path = resolve(
		`./static/assets/packs/${pack.ownerName}/${pack.name}/${pack.packVersion}/${pack.id}`,
		event.params.path,
	);

	// TODO: Fix this.
	// if (!await fs.exists(path)) {
	// 	return json({ message: "File specified by path not found." }, { status: 404 });
	// }

	const stats = await fs.stat(path);

	let content = "";
	if (stats.isFile()) {
		content = await fs.readFile(path, "utf8");
	}

	const type = stats.isDirectory() ? "directory" : "file";

	return json({
		type,
		size: stats.size,
		content,
	});
}
