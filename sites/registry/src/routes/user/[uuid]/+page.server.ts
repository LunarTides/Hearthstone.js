import { resolve } from "$app/paths";
import { pack, type Card } from "$lib/db/schema.js";
import { db } from "$lib/server/db/index.js";
import { getFullPacks } from "$lib/server/db/pack";
import { error } from "@sveltejs/kit";
import { and, arrayContains } from "drizzle-orm";

// TODO: Deduplicate from `pack/[uuid]/+layout.server.ts`
export const load = async (event) => {
	const user = event.locals.user;
	const uuid = event.params.uuid;

	const packs = await getFullPacks(
		user,
		db
			.select()
			.from(pack)
			.where(and(arrayContains(pack.userIds, [uuid])))
			.$dynamic(),
	);
	if (packs.length <= 0) {
		return {
			packs: [],
			cards: [],
		};
	}

	const version = packs[0];

	const packsToReturn = [];

	const uniquePacks = new Set(packs.map((p) => p.uuid));
	for (const uniquePack of uniquePacks) {
		const relevantPacks = packs.filter((p) => p.uuid === uniquePack);
		packsToReturn.push({
			uuid: uniquePack,
			relevantPacks,
		});
	}

	const response = await event.fetch(
		resolve("/api/v1/pack/[uuid]/[version]/cards", { uuid: version.uuid, version: version.id }),
	);

	const json = await response.json();
	if (response.status !== 200) {
		return error(response.status, { message: json.message });
	}

	return {
		packs: packsToReturn,
		cards: json as Card[],
	};
};
