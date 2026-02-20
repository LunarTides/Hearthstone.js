import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
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
	if (!pack || !isUserMemberOfGroup(clientUser, clientUser.username, username)) {
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
				and(
					eq(table.packLike.packOwnerName, pack.ownerName),
					eq(table.packLike.packName, pack.name),
					eq(table.packLike.username, clientUser.username),
				),
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
		packOwnerName: pack.ownerName,
		packName: pack.name,
		username: clientUser.username,
		dislike: false,
	});

	return json({}, { status: 200 });
}
