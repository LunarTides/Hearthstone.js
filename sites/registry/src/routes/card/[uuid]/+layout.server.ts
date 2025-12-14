import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { card } from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { loadGetPack } from "$lib/server/db/pack.js";

export const load = (event) => {
	const user = event.locals.user;
	const uuid = event.params.uuid;

	const getCards = async () => {
		const cards = await db.select().from(card).where(eq(card.uuid, uuid));
		if (cards.length <= 0) {
			error(404, { message: m.card_not_found() });
		}

		const latest = cards.find((c) => c.isLatestVersion)!;

		return {
			packs: await loadGetPack(user, latest.packId),
			latest: latest,
			all: cards,
		};
	};

	return {
		cards: getCards(),
	};
};
