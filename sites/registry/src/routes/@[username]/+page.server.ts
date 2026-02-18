import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { PackWithExtras } from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";

// TODO: Deduplicate from `pack/[uuid]/+layout.server.ts`
export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const username = event.params.username;

	const packResponse = await requestAPI<
		{
			name: string;
			versions: {
				latest: PackWithExtras;
				outdated: PackWithExtras[];
			};
		}[]
	>(event, resolve("/api/next/@[username]/packs", { username }));
	if (packResponse.error) {
		return error(packResponse.error.status, packResponse.error.message);
	}

	const packs = packResponse.json;
	if (packs.length <= 0) {
		return {
			packs: [],
			cards: [],
		};
	}

	return {
		packs,
	};
};
