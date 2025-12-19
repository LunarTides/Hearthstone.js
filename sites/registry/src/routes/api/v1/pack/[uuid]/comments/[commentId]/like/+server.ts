import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack, packCommentLike } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";

// TODO: Deduplicate.
export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: m.login_required() }, { status: 401 });
	}

	const uuid = event.params.uuid;
	const p = (
		await db
			.select()
			.from(pack)
			.where(and(eq(pack.uuid, uuid), eq(pack.isLatestVersion, true)))
			.limit(1)
	).at(0);
	if (!p) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	if (!p.approved) {
		// eslint-disable-next-line no-empty
		if (p.userIds.includes(clientUser.id) || satisfiesRole(clientUser, "Moderator")) {
		} else {
			return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
		}
	}

	const commentId = event.params.commentId;

	const like = (
		await db.select().from(packCommentLike).where(eq(packCommentLike.commentId, commentId)).limit(1)
	).at(0);
	if (like) {
		if (like.dislike) {
			await db
				.update(packCommentLike)
				.set({ dislike: false })
				.where(eq(packCommentLike.id, like.id));
		} else {
			await db.delete(packCommentLike).where(eq(packCommentLike.id, like.id));
		}

		return json({}, { status: 200 });
	}

	await db.insert(packCommentLike).values({
		commentId,
		userId: event.locals.user.id,
		dislike: false,
	});

	return json({}, { status: 200 });
}
