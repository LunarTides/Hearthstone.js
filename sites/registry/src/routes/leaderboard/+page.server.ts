import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { CensoredUser } from "$lib/user.js";
import { error } from "@sveltejs/kit";

export const load = (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const getResult = async () => {
		const response = await requestAPI<CensoredUser[]>(
			event,
			resolve("/api/v1/leaderboard/karma") + `?page=1`,
		);
		if (response.error) {
			error(response.error.status, { message: response.error.message });
		}

		return {
			leaderboard: response.json,
		};
	};

	return getResult();
};
