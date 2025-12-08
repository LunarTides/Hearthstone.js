import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { card, pack } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { like } from "drizzle-orm";

export async function load(event) {
	const query = event.url.searchParams.get("q");
	if (!query) {
		error(400, { message: m.query_not_found() });
	}

	const packs = async () => {
		// TODO: Filter by approved.
		const packs = await db
			.select()
			.from(pack)
			.where(like(pack.name, `%${query}%`));

		return packs;
	};

	const cards = async () => {
		const cards = await db
			.select()
			.from(card)
			.where(like(card.name, `%${query}%`));

		return cards;
	};

	return { packs: packs(), cards: cards() };
}
