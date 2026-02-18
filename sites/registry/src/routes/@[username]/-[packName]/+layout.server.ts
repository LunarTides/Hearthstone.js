import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { Card } from "$lib/db/schema.js";
import type { CensoredPack } from "$lib/pack.js";
import { loadGetPack } from "$lib/server/db/pack";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

const getCards = async (event: ServerLoadEvent, pack: CensoredPack) => {
	const response = await requestAPI<Card[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/v[version]/cards", {
			username: pack.ownerName,
			packName: pack.name,
			version: pack.packVersion,
		}),
	);
	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	return response.json;
};

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const user = event.locals.user;
	const { username, packName } = event.params;

	// TODO: Query API instead.
	const packs = await loadGetPack(user, username, packName);
	const latest = packs.latest;

	const latestCards = await getCards(event, latest);

	return {
		packs,
		latestCards,
	};
};
