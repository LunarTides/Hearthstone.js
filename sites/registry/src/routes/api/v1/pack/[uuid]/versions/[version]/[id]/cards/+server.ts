import { db } from "$lib/server/db/index.js";
import { card, pack } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";

export async function GET(event) {
	const user = event.locals.user;

	const uuid = event.params.uuid;
	const packVersion = event.params.version;
	const id = event.params.id;

	const version = (
		await db
			.select()
			.from(pack)
			.where(and(eq(pack.uuid, uuid), eq(pack.packVersion, packVersion), eq(pack.id, id)))
	).at(0);
	if (!version) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!version.approved) {
		// eslint-disable-next-line no-empty
		if (user && (version.userIds.includes(user.id) || satisfiesRole(user, "Moderator"))) {
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const cards = await db.select().from(card).where(eq(card.packId, version.id));

	return json(cards);
}
