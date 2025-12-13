import { loadGetPack } from "$lib/server/db/pack";

export async function load(event) {
	const user = event.locals.user;
	const uuid = event.params.uuid;

	return {
		packs: loadGetPack(user, uuid),
	};
}
