import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { card } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function load(event) {
	const uuid = event.params.uuid;

	const c = await db.select().from(card).where(eq(card.uuid, uuid)).limit(1);
	if (c.length <= 0) {
		error(404, { message: m.card_not_found() });
	}

	return {
		card: c[0],
	};
}
