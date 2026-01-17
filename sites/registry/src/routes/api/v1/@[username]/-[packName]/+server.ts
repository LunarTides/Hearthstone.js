import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import fs from "node:fs/promises";

// TODO: Deduplicate.
export async function DELETE(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const username = event.params.username;
	const packName = event.params.packName;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(and(eq(table.pack.ownerName, username), eq(table.pack.name, packName)))
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

	await db
		.delete(table.packComment)
		.where(
			and(
				eq(table.packComment.packOwnerName, pack.ownerName),
				eq(table.packComment.packName, pack.name),
			),
		);
	// TODO: Delete *all* pack messages.
	await db.delete(table.packMessage).where(eq(table.packMessage.packId, pack.id));
	await db
		.delete(table.packLike)
		.where(
			and(eq(table.packLike.packOwnerName, pack.ownerName), eq(table.packLike.packName, pack.name)),
		);
	await db
		.delete(table.pack)
		.where(and(eq(table.pack.ownerName, pack.ownerName), eq(table.pack.name, pack.name)));
	// TODO: Make sure this is safe.
	await fs.rm(`./static/assets/packs/${pack.ownerName}/${pack.name}`, {
		force: true,
		recursive: true,
	});

	return json({}, { status: 200 });
}
