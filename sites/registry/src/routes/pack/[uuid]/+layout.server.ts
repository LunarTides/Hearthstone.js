import { loadGetPack } from "$lib/server/db/pack";

export async function load(event) {
	const uuid = event.params.uuid;

	return {
		packs: loadGetPack(uuid),
	};
}
