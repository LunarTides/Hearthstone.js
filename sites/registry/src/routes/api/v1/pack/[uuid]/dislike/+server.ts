import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack, packLike } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";

// TODO: Deduplicate code between this and like.
export async function POST(event) {
	if (!event.locals.user) {
		return json({ message: m.login_required() }, { status: 401 });
	}

	const uuid = event.params.uuid;
	const version = (
		await db
			.select()
			.from(pack)
			.where(and(eq(pack.uuid, uuid), eq(pack.isLatestVersion, true)))
			.limit(1)
	).at(0);
	if (!version) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	if (!version.approved) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	const like = (
		await db
			.select()
			.from(packLike)
			.where(and(eq(packLike.packId, version.uuid), eq(packLike.userId, event.locals.user.id)))
			.limit(1)
	).at(0);
	if (like) {
		if (like.dislike) {
			await db.delete(packLike).where(eq(packLike.id, like.id));
		} else {
			await db.update(packLike).set({ dislike: true }).where(eq(packLike.id, like.id));
		}

		return json({}, { status: 200 });
	}

	await db.insert(packLike).values({
		packId: version.uuid,
		userId: event.locals.user.id,
		dislike: true,
	});

	return json({}, { status: 200 });
}
