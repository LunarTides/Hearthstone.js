import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { Resource, PackWithExtras } from "$lib/db/schema.js";
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
			resolve("/api/next/search/packs") + `?q=${event.url.searchParams.get("q")}&page=${page}`,
		);
		if (packsResponse.error) {
			error(packsResponse.error.status, { message: packsResponse.error.message });
		}

		const resourcesResponse = await requestAPI<{ resource: Resource; pack: PackWithExtras }[]>(
			event,
			resolve("/api/next/search/resources") + `?q=${event.url.searchParams.get("q")}&page=${page}`,
		);
		// if (resourcesResponse.status !== 200) {
		// 	error(resourcesResponse.status, { message: resourcesResponse.message });
		// }

		return {
			resources: resourcesResponse.error ? [] : resourcesResponse.json,
			packs: packsResponse.json,
		};
	};

	return getResult();
};
