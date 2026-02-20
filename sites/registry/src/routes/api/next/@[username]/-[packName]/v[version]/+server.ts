import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import fs from "node:fs/promises";
import { getFullPacks, setLatestVersion } from "$lib/server/db/pack.js";
import { isUserMemberOfPack } from "$lib/server/db/pack.js";
import { censorPack } from "$lib/pack.js";

export async function GET(event) {
	const clientUser = event.locals.user;
	const { username, packName, version } = event.params;

	const pack = (
		await getFullPacks(
			clientUser,
			db
				.select()
				.from(table.pack)
				.where(
					and(
						eq(table.pack.ownerName, username),
						eq(table.pack.name, packName),
						eq(table.pack.packVersion, version),
					),
				)
				.limit(1)
				.$dynamic(),
    )
	).at(0);
	if (!pack) {
		return json({ message: "No pack found matching those parameters." }, { status: 404 });
	}

	if (!pack.approved) {
		if (!clientUser || !isUserMemberOfPack(clientUser, clientUser.username, pack)) {
			// Hide the pack.
			return json({ message: "No pack found matching those parameters." }, { status: 404 });
		}
	}

	return json(censorPack(pack, clientUser));
}

export async function DELETE(event) {
	// TODO: Rename to clientUser
	const user = event.locals.user;
	if (!user) {
		// TODO: Add status code.
		return json({ message: "Please log in." });
	}

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

	if (!isUserMemberOfPack(user, username, pack)) {
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
