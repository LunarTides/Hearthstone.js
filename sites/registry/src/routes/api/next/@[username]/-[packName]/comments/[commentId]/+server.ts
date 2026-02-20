import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

export async function DELETE(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const username = event.params.username;
	const packName = event.params.packName;
	const commentId = event.params.commentId;

	const packs = await db
		.select()
		.from(table.pack)
		.where(and(eq(table.pack.ownerName, username), eq(table.pack.name, packName)));
	if (packs.length <= 0) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const pack = packs.find((pack) => pack.isLatestVersion) ?? packs[0];
	if (!pack.approved && !isUserMemberOfGroup(clientUser, clientUser.username, username)) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const comment = (
		await db.select().from(table.comment).where(eq(table.comment.id, commentId)).limit(1)
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

	await db.delete(table.comment).where(eq(table.comment.id, commentId));

	return json({}, { status: 200 });
}
