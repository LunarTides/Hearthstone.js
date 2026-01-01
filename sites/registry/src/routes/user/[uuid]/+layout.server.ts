import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { UserAndProfile } from "$lib/user.js";
import { error } from "@sveltejs/kit";

export const load = (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const uuid = event.params.uuid;

	const getUser = async () => {
		const response = await requestAPI<UserAndProfile>(
			event,
			resolve(`/api/v1/user/[uuid]`, { uuid }),
		);
		if (response.error) {
			error(response.error.status, { message: response.error.message });
		}

		return response.json;
	};

	return {
		currentUser: getUser(),
	};
};
