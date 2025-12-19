import { resolve } from "$app/paths";
import type { Card } from "$lib/db/schema.js";
import type { CensoredPack } from "$lib/pack.js";
import { loadGetPack } from "$lib/server/db/pack";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { error } from "console";

const getCards = async (event: ServerLoadEvent, version: CensoredPack) => {
	const response = await event.fetch(
		resolve("/api/v1/pack/[uuid]/versions/[version]/cards", {
			uuid: version.uuid,
			version: version.packVersion,
		}),
	);

	const json = await response.json();
	if (response.status !== 200) {
		return error(response.status, { message: json.message });
	}

	return json as Card[];
};

export const load = async (event) => {
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
