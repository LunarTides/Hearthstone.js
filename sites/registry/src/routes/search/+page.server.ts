import { m } from "$lib/paraglide/messages.js";
import type { card, pack } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import type { InferSelectModel } from "drizzle-orm";

export async function load(event) {
	const query = event.url.searchParams.get("q");
	if (!query) {
		error(400, { message: m.query_not_found() });
	}

	const page = event.url.searchParams.get("page") || "1";

	const getResult = async () => {
		const packsResponse = await event.fetch(
			`/api/search/packs?q=${event.url.searchParams.get("q")}&page=${page}`,
		);
		const packs = await packsResponse.json();
		if (packsResponse.status !== 200) {
			error(packsResponse.status, { message: packs.message });
		}

		const cardsResponse = await event.fetch(
			`/api/search/cards?q=${event.url.searchParams.get("q")}&page=${page}`,
		);
		const cards = await cardsResponse.json();
		if (cardsResponse.status !== 200) {
			error(cardsResponse.status, { message: cards.message });
		}

		return {
			cards: cards as {
				card: InferSelectModel<typeof card>;
				pack: InferSelectModel<typeof pack>;
			}[],
			packs: packs as InferSelectModel<typeof pack>[],
		};
	};

	return getResult();
}
