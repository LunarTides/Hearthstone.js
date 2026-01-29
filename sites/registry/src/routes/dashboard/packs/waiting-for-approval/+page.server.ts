import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { PackWithExtras } from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";

export const load = (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const page = event.url.searchParams.get("page") || "1";

	const getResult = async () => {
		const response = await requestAPI<PackWithExtras[]>(
			event,
			resolve("/api/next/moderation/packs/list/waiting-for-approval") + `?page=${page}`,
		);
		if (response.error) {
			error(response.error.status, { message: response.error.message });
		}

		return {
			packs: response.json,
		};
	};

	return getResult();
};
