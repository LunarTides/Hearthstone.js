import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack } from "$lib/db/schema.js";
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
	const version = (
		await db
			.select()
			.from(pack)
			.where(and(eq(pack.uuid, uuid), eq(pack.packVersion, packVersion)))
	).at(0);
	if (!version) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	if (!version.approved) {
		// eslint-disable-next-line no-empty
		if (user && (version.userIds.includes(user.id) || satisfiesRole(user, "Moderator"))) {
		} else {
			return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
		}
	}

	// TODO: Validate. Make sure the path isn't too long, etc...
	const path = resolve(
		`./static/assets/packs/${version.uuid}/${version.packVersion}`,
		event.params.path,
	);

	// TODO: Fix this.
	// if (!await fs.exists(path)) {
	// 	// TODO: i18n
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
