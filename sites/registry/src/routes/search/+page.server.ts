import { requestAPI } from "$lib/api/helper.js";
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
		const packsResponse = await requestAPI<PackWithExtras[]>(
			event,
			`/api/v1/search/packs?q=${event.url.searchParams.get("q")}&page=${page}`,
		);
		if (packsResponse.error) {
			error(packsResponse.error.status, { message: packsResponse.error.message });
		}

		const cardsResponse = await requestAPI<{ card: Card; pack: PackWithExtras }[]>(
			event,
			`/api/v1/search/cards?q=${event.url.searchParams.get("q")}&page=${page}`,
		);
		// if (cardsResponse.status !== 200) {
		// 	error(cardsResponse.status, { message: cards.message });
		// }

		return {
			cards: cardsResponse.error ? [] : cardsResponse.json,
			packs: packsResponse.json,
		};
	};

	return getResult();
};
