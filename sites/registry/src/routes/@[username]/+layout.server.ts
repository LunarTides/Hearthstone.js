import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { Group } from "$lib/db/schema.js";
import type { UserAndProfile } from "$lib/user.js";
import { error } from "@sveltejs/kit";

export const load = (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const username = event.params.username;

	const getUser = async () => {
		const response = await requestAPI<
			(UserAndProfile & { ownerType: "User" }) | (Group & { ownerType: "Group" })
		>(event, resolve(`/api/next/@[username]`, { username }));
		if (response.error) {
			error(response.error.status, { message: response.error.message });
		}

		return response.json;
	};

	return {
		currentUser: getUser(),
	};
};
