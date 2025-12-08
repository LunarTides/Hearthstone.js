import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { card } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function load(event) {
	const uuid = event.params.uuid;

	const getCard = async () => {
		const cards = await db.select().from(card).where(eq(card.uuid, uuid)).limit(1);
		if (cards.length <= 0) {
			error(404, { message: m.card_not_found() });
		}

		return cards[0];
	};

	return {
		card: getCard(),
	};
}
