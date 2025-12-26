import type { Card, PackWithExtras } from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";

export const load = (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const query = event.url.searchParams.get("q");
	if (!query) {
		error(400, { message: "Please specify a search query." });
	}

	const page = event.url.searchParams.get("page") || "1";

	const getResult = async () => {
		const packsResponse = await event.fetch(
			`/api/v1/search/packs?q=${event.url.searchParams.get("q")}&page=${page}`,
		);
		const packs = await packsResponse.json();
		if (packsResponse.status !== 200) {
			error(packsResponse.status, { message: packs.message });
		}

		const cardsResponse = await event.fetch(
			`/api/v1/search/cards?q=${event.url.searchParams.get("q")}&page=${page}`,
		);
		const cardsJson = await cardsResponse.json();
		// if (cardsResponse.status !== 200) {
		// 	error(cardsResponse.status, { message: cards.message });
		// }

		const cards = !cardsJson.message ? cardsJson : [];

		return {
			cards: cards as {
				card: Card;
				pack: PackWithExtras;
			}[],
			packs: packs as PackWithExtras[],
		};
	};

	return getResult();
};
