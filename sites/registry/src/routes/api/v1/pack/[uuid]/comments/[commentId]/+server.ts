import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";

export async function DELETE(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const uuid = event.params.uuid;
	const commentId = event.params.commentId;
	const packs = await db.select().from(table.pack).where(eq(table.pack.uuid, uuid));
	if (packs.length <= 0) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const pack = packs.find((pack) => pack.isLatestVersion) ?? packs[0];
	if (!pack.approved) {
		if (
			clientUser &&
			(pack.ownerName === clientUser.username || satisfiesRole(clientUser, "Moderator"))
		) {
			// eslint-disable no-empty
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const comment = (
		await db.select().from(table.packComment).where(eq(table.packComment.id, commentId)).limit(1)
	).at(0);
	if (!comment) {
		return json({ message: "No comment found with that id." }, { status: 404 });
	}

	if (comment.username !== clientUser.username && !satisfiesRole(clientUser, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	await db.delete(table.packComment).where(eq(table.packComment.id, commentId));

	return json({}, { status: 200 });
}
