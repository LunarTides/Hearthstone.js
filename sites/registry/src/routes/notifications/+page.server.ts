import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { Notification } from "$lib/db/schema";
import { fail, redirect } from "@sveltejs/kit";

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const response = await requestAPI<{ notifications: Notification[] }>(
		event,
		resolve("/api/v1/notifications"),
	);
	if (response.error) {
		return fail(response.error.status, { message: response.error.message });
	}

	return { notifications: response.json.notifications };
};

export const actions = {
	// TODO: Deduplicate.
	clear: async (event) => {
		const response = await requestAPI(event, resolve("/api/v1/notifications/clear"), {
			method: "POST",
		});
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		redirect(302, resolve("/notifications"));
	},
};
