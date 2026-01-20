import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import fs from "node:fs/promises";
import { setLatestVersion } from "$lib/server/db/pack.js";

export async function DELETE(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const username = event.params.username;
	const packName = event.params.packName;
	const packVersion = event.params.version;
	const id = event.params.id;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, packVersion),
					eq(table.pack.id, id),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (pack.ownerName !== user.username && !satisfiesRole(user, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	await db.delete(table.pack).where(eq(table.pack.id, pack.id));
	// TODO: Make sure this is safe.
	await fs.rm(
		`./static/assets/packs/${pack.ownerName}/${pack.name}/${pack.packVersion}/${pack.id}`,
		{
			force: true,
			recursive: true,
		},
	);

	await db.delete(table.packMessage).where(eq(table.packMessage.packId, pack.id));
	await setLatestVersion(pack.ownerName, pack.name);

	return json({}, { status: 200 });
}
