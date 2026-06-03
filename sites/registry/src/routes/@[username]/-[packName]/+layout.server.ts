import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { Resource } from "$lib/db/schema.js";
import type { CensoredPack } from "$lib/pack.js";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

const getResources = async (event: ServerLoadEvent, pack: CensoredPack) => {
	const response = await requestAPI<Resource[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/v[version]/resources", {
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
	const { username, packName } = event.params;

	// TODO: Query API instead.
	const packResponse = await requestAPI<{ latest: CensoredPack; outdated: CensoredPack[] }>(
		event,
		resolve("/api/next/@[username]/-[packName]", { username, packName }),
	);
	if (packResponse.error) {
		return error(packResponse.error.status, { message: packResponse.error.message });
	}

	const { latest, outdated } = packResponse.json;
	const latestResources = await getResources(event, latest);

	return {
		versions: [latest, ...outdated],
		latestResources,
	};
};
