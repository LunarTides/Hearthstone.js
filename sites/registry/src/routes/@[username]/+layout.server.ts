import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { GroupAndProfile } from "$lib/group.js";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";
import type { UserAndProfile } from "$lib/user.js";
import { error } from "@sveltejs/kit";

export const load = (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const clientUser = event.locals.user;
	const username = event.params.username;

	const getUser = async () => {
		const response = await requestAPI<
			(UserAndProfile & { type: "User" }) | (GroupAndProfile & { type: "Group" })
		>(event, resolve(`/api/next/@[username]`, { username }));
		if (response.error) {
			error(response.error.status, { message: response.error.message });
		}

		return response.json;
	};

	const canEditUser = async () => {
		return await isUserMemberOfGroup(clientUser, clientUser?.username, username);
	};

	return {
		currentUser: getUser(),
		canEditUser: canEditUser(),
	};
};
