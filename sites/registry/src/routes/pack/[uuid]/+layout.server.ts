import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { Card } from "$lib/db/schema.js";
import type { CensoredPack } from "$lib/pack.js";
import { loadGetPack } from "$lib/server/db/pack";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

const getCards = async (event: ServerLoadEvent, version: CensoredPack) => {
	const response = await requestAPI<Card[]>(
		event,
		resolve("/api/v1/pack/[uuid]/versions/[version]/[id]/cards", {
			uuid: version.uuid,
			version: version.packVersion,
			id: version.id,
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
	const uuid = event.params.uuid;

	const packs = await loadGetPack(event.locals.user, event.params.uuid);
	const version = packs.latest;

	const cards = await getCards(event, version);

	return {
		packs: loadGetPack(user, uuid),
		cards,
	};
};
