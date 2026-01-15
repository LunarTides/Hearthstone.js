import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import fs from "fs/promises";

// TODO: Deduplicate.
export async function DELETE(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const uuid = event.params.uuid;

	const pack = (await db.select().from(table.pack).where(eq(table.pack.uuid, uuid))).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.userIds.includes(user.id) && !satisfiesRole(user, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	await db.delete(table.packComment).where(eq(table.packComment.packId, pack.uuid));
	// TODO: Delete *all* pack messages.
	await db.delete(table.packMessage).where(eq(table.packMessage.packId, pack.id));
	await db.delete(table.packLike).where(eq(table.packLike.packId, pack.uuid));
	await db.delete(table.pack).where(eq(table.pack.uuid, pack.uuid));
	await fs.rm(`./static/assets/packs/${pack.uuid}`, { force: true, recursive: true });

	return json({}, { status: 200 });
}
