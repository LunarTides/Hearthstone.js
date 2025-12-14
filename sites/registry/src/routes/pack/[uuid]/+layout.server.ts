import { resolve } from "$app/paths";
import type { Card } from "$lib/db/schema.js";
import { loadGetPack } from "$lib/server/db/pack";
import { error } from "console";

export const load = async (event) => {
	const user = event.locals.user;
	const uuid = event.params.uuid;

	const packs = await loadGetPack(event.locals.user, event.params.uuid);
	const version = packs.latest;

	const response = await event.fetch(
		resolve("/api/v1/pack/[uuid]/[version]/cards", { uuid: version.uuid, version: version.id }),
	);

	const json = await response.json();
	if (response.status !== 200) {
		return error(response.status, { message: json.message });
	}

	return {
		packs: loadGetPack(user, uuid),
		cards: json as Card[],
	};
};
