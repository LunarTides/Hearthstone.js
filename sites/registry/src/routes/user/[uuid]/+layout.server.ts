import { resolve } from "$app/paths";
import type { UserAndProfile } from "$lib/user.js";
import { error } from "@sveltejs/kit";

export const load = (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const uuid = event.params.uuid;

	const getUser = async () => {
		const usersResponse = await event.fetch(resolve(`/api/v1/user/[uuid]`, { uuid }));
		const u = await usersResponse.json();
		if (usersResponse.status !== 200) {
			error(usersResponse.status, { message: u.message });
		}

		return u as UserAndProfile;
	};

	return {
		currentUser: getUser(),
	};
};
