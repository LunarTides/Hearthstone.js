import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";

export async function POST(event) {
	if (!event.locals.user) {
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
		return json({ message: "Version not found." }, { status: 404 });
	}

	const like = (
		await db
			.select()
			.from(table.packLike)
			.where(
				and(eq(table.packLike.packId, pack.uuid), eq(table.packLike.userId, event.locals.user.id)),
			)
			.limit(1)
	).at(0);
	if (like) {
		if (like.dislike) {
			await db.update(table.packLike).set({ dislike: false }).where(eq(table.packLike.id, like.id));
		} else {
			await db.delete(table.packLike).where(eq(table.packLike.id, like.id));
		}

		return json({}, { status: 200 });
	}

	await db.insert(table.packLike).values({
		packId: pack.uuid,
		userId: event.locals.user.id,
		dislike: false,
	});

	return json({}, { status: 200 });
}
