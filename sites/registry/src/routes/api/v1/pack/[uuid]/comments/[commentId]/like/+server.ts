import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";

// TODO: Deduplicate.
// TODO: Split into POST and DELETE for likes and unlikes.
export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const uuid = event.params.uuid;
	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(and(eq(table.pack.uuid, uuid), eq(table.pack.isLatestVersion, true)))
			.limit(1)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved) {
		// eslint-disable-next-line no-empty
		if (pack.ownerName === clientUser.username || satisfiesRole(clientUser, "Moderator")) {
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const commentId = event.params.commentId;

	const like = (
		await db
			.select()
			.from(table.packCommentLike)
			.where(
				and(
					eq(table.packCommentLike.commentId, commentId),
					eq(table.packCommentLike.username, clientUser.username),
				),
			)
			.limit(1)
	).at(0);
	if (like) {
		if (like.dislike) {
			await db
				.update(table.packCommentLike)
				.set({ dislike: false })
				.where(eq(table.packCommentLike.id, like.id));
		} else {
			await db.delete(table.packCommentLike).where(eq(table.packCommentLike.id, like.id));
		}

		return json({}, { status: 200 });
	}

	await db.insert(table.packCommentLike).values({
		commentId,
		username: clientUser.username,
		dislike: false,
	});

	return json({}, { status: 200 });
}
