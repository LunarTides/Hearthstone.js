import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import semver from "semver";
import fs from "node:fs/promises";

export async function DELETE(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

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

	if (!pack.userIds.includes(user.id) && !satisfiesRole(user, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	await db.delete(table.pack).where(eq(table.pack.id, pack.id));
	await fs.rm(`./static/assets/packs/${pack.uuid}/${pack.packVersion}/${pack.id}`, {
		force: true,
		recursive: true,
	});

	await db.delete(table.packMessage).where(eq(table.packMessage.packId, pack.id));

	const packs = await db
		.select({ id: table.pack.id, packVersion: table.pack.packVersion })
		.from(table.pack)
		.where(eq(table.pack.uuid, uuid));
	const newLatestPack = packs
		.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))
		.at(0);
	if (newLatestPack) {
		await db
			.update(table.pack)
			.set({ isLatestVersion: true })
			.where(eq(table.pack.id, newLatestPack.id));
		await db
			.update(table.card)
			.set({ isLatestVersion: true })
			.where(eq(table.card.packId, newLatestPack.id));
	}

	return json({}, { status: 200 });
}
