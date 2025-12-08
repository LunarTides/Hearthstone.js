import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { card } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function load(event) {
	const uuid = event.params.uuid;

	const getCards = async () => {
		const cards = await db.select().from(card).where(eq(card.uuid, uuid));
		if (cards.length <= 0) {
			error(404, { message: m.card_not_found() });
		}

		return {
			latest: cards.find((c) => c.isLatestVersion),
			all: cards,
		};
	};

	return {
		cards: getCards(),
	};
}
