import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";
import { hasGradualPermission } from "$lib/server/auth";

// TODO: Deduplicate.
// TODO: Split into POST and DELETE for likes and unlikes.
export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	if (!hasGradualPermission(event.locals.token?.permissions, "comments.like")) {
		return json({ message: "This request is outside the scope of this token." }, { status: 403 });
	}

	const username = event.params.username;
	const packName = event.params.packName;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.isLatestVersion, true),
				),
			)
			.limit(1)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved && !(await isUserMemberOfGroup(clientUser, clientUser.username, username))) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const commentId = event.params.commentId;

	const like = (
		await db
			.select()
			.from(table.commentLike)
			.where(
				and(
					eq(table.commentLike.commentId, commentId),
					eq(table.commentLike.username, clientUser.username),
				),
			)
			.limit(1)
	).at(0);
	if (like) {
		if (like.dislike) {
			await db
				.update(table.commentLike)
				.set({ dislike: false })
				.where(eq(table.commentLike.id, like.id));
		} else {
			await db.delete(table.commentLike).where(eq(table.commentLike.id, like.id));
		}

		return json({}, { status: 200 });
	}

	await db.insert(table.commentLike).values({
		commentId,
		username: clientUser.username,
		dislike: false,
	});

	return json({}, { status: 200 });
}
