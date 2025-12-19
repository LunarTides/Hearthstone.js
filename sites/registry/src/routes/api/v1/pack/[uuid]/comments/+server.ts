import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack, packComment } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and, count } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import { getFullPackComment } from "$lib/server/db/comment.js";

export async function GET(event) {
	// TODO: Extract page logic.
	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: m.gray_steep_husky_gaze() }, { status: 400 });
	}

	const user = event.locals.user;

	const uuid = event.params.uuid;
	const packs = await db
		.select()
		.from(pack)
		.where(and(eq(pack.uuid, uuid)));
	if (packs.length <= 0) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	const p = packs.find((p) => p.isLatestVersion) ?? packs[0];

	if (!p.approved) {
		// eslint-disable-next-line no-empty
		if (user && (p.userIds.includes(user.id) || satisfiesRole(user, "Moderator"))) {
		} else {
			return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
		}
	}

	const comments = await getFullPackComment(
		user,
		db
			.select()
			.from(packComment)
			.where(eq(packComment.packId, p.uuid))
			.limit(10)
			.offset((page - 1) * 10)
			.$dynamic(),
	);

	const amount = await db
		.select({ count: count() })
		.from(packComment)
		.where(eq(packComment.packId, p.uuid));

	return json(comments, {
		headers: {
			"X-Comment-Amount": amount[0].count.toString(),
		},
	});
}
