import type { CommentWithExtras } from "$lib/db/schema";
import * as table from "$lib/db/schema";
import { censorUser } from "$lib/user";
import { asc, eq } from "drizzle-orm";
import { alias, type PgSelect } from "drizzle-orm/pg-core";
import type { ClientUser } from "../auth";
import { censorPack } from "$lib/pack";

export const getFullPackComment = async <T extends PgSelect<"comment">>(
	clientUser: ClientUser | null,
	query: T,
) => {
	const heartedBy = alias(table.user, "heartedBy");

	const packComments = await query
		.orderBy(asc(table.comment.creationDate))
		.fullJoin(table.commentLike, eq(table.comment.id, table.commentLike.commentId))
		.fullJoin(table.user, eq(table.comment.username, table.user.username))
		.fullJoin(table.pack, eq(table.comment.packId, table.pack.id))
		.fullJoin(heartedBy, eq(table.comment.heartedByUsername, heartedBy.username));

	// Show all comments.
	// TODO: Deduplicate.
	const comments: CommentWithExtras[] = [];

	for (const p of packComments) {
		if (comments.some((v) => v.id === p.comment.id)) {
			continue;
		}

		const relevantComments = packComments.filter((v) => v.comment.id === p.comment.id);

		// NOTE: Can't do `!p.commentLike?.dislike` since then an undefined `packCommentLike` will return true.
		const likesPositive = relevantComments.filter((p) => p.commentLike?.dislike === false);
		const likesNegative = relevantComments.filter((p) => p.commentLike?.dislike);
		const likes = new Set(likesPositive.map((p) => p.commentLike?.username));
		const dislikes = new Set(likesNegative.map((p) => p.commentLike?.username));

		comments.push({
			...p.comment,
			author: p.user && censorUser(p.user, clientUser),
			pack: censorPack(p.pack!, clientUser),
			likes: {
				positive: likes.size,
				hasLiked: clientUser ? likes.has(clientUser.username) : false,
				negative: dislikes.size,
				hasDisliked: clientUser ? dislikes.has(clientUser.username) : false,
			},
			heartedBy: p.heartedBy && censorUser(p.heartedBy, clientUser),
		});
	}

	return comments;
};
