import { db } from "$lib/server/db/index.js";
import { pack, packComment } from "$lib/db/schema.js";
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
	const packs = await db.select().from(pack).where(eq(pack.uuid, uuid));
	if (packs.length <= 0) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const p = packs.find((p) => p.isLatestVersion) ?? packs[0];
	if (!p.approved) {
		if (
			clientUser &&
			(p.userIds.includes(clientUser.id) || satisfiesRole(clientUser, "Moderator"))
		) {
			// eslint-disable no-empty
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const c = (await db.select().from(packComment).where(eq(packComment.id, commentId)).limit(1)).at(
		0,
	);
	if (!c) {
		return json({ message: "No comment found with that id." }, { status: 404 });
	}

	if (c.authorId !== clientUser.id && !satisfiesRole(clientUser, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	await db.delete(packComment).where(eq(packComment.id, commentId));

	return json({}, { status: 200 });
}
