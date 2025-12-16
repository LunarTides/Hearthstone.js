import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { card, pack } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";

export async function GET(event) {
	const user = event.locals.user;

	const packVersion = event.params.version;
	const version = (await db.select().from(pack).where(eq(pack.packVersion, packVersion))).at(0);
	if (!version) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	if (!version.approved) {
		// eslint-disable-next-line no-empty
		if (user && (version.userIds.includes(user.id) || satisfiesRole(user, "Moderator"))) {
		} else {
			return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
		}
	}

	const cards = await db.select().from(card).where(eq(card.packId, version.id));

	return json(cards);
}
