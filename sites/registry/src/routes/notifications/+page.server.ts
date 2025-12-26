import { resolve } from "$app/paths";
import type { Notification } from "$lib/db/schema";
import { fail, redirect } from "@sveltejs/kit";

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const response = await event.fetch(resolve("/api/v1/notifications"));

	const json = await response.json();
	if (response.status !== 200) {
		return fail(response.status, { message: json.message });
	}

	return { notifications: json.notifications as Notification[] };
};

export const actions = {
	// TODO: Deduplicate.
	clear: async (event) => {
		const response = await event.fetch(resolve("/api/v1/notifications/clear"), {
			method: "POST",
		});
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}

		redirect(302, resolve("/notifications"));
	},
};
