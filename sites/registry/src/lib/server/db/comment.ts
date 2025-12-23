import { packCommentLike, user, type PackCommentWithExtras, packComment } from "$lib/db/schema";
import { censorUser } from "$lib/user";
import { asc, eq } from "drizzle-orm";
import { alias, type PgSelect } from "drizzle-orm/pg-core";
import type { ClientUser } from "../auth";

export const getFullPackComment = async <T extends PgSelect<"packComment">>(
	clientUser: ClientUser | null,
	query: T,
) => {
	const heartedBy = alias(user, "heartedBy");

	const packComments = await query
		.orderBy(asc(packComment.creationDate))
		.fullJoin(packCommentLike, eq(packComment.id, packCommentLike.commentId))
		.fullJoin(user, eq(packComment.authorId, user.id))
		.fullJoin(heartedBy, eq(packComment.heartedById, heartedBy.id));

	// Show all comments.
	// TODO: Deduplicate.
	const comments: PackCommentWithExtras[] = packComments.map((p) => {
		const relevantComments = packComments.filter((v) => v.packComment!.id === p.packComment!.id);

		// NOTE: Can't do `!p.packCommentLike?.dislike` since then an undefined `packCommentLike` will return true.
		const likesPositive = relevantComments.filter((p) => p.packCommentLike?.dislike === false);
		const likesNegative = relevantComments.filter((p) => p.packCommentLike?.dislike);
		const likes = new Set(likesPositive.map((p) => p.packCommentLike?.userId));
		const dislikes = new Set(likesNegative.map((p) => p.packCommentLike?.userId));

		return {
			...p.packComment,
			author: censorUser(p.user!),
			likes: {
				positive: likes.size,
				hasLiked: clientUser ? likes.has(clientUser.id) : false,
				negative: dislikes.size,
				hasDisliked: clientUser ? dislikes.has(clientUser.id) : false,
			},
			heartedBy: p.heartedBy ? censorUser(p.heartedBy) : null,
		};
	});

	return comments;
};
