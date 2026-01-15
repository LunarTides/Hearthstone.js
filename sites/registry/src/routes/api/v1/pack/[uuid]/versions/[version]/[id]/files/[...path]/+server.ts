import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import fs from "fs/promises";
import { resolve } from "path";
import { satisfiesRole } from "$lib/user";

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

	// TODO: Validate. Make sure the path isn't too long, etc...
	const path = resolve(
		`./static/assets/packs/${pack.uuid}/${pack.packVersion}/${pack.id}`,
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
