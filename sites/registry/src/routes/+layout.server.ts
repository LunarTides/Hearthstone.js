import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { Notification } from "$lib/db/schema";

export const load = async (event) => {
	const user = event.locals.user;

	const notifications = requestAPI<{ notifications: Notification[] }>(
		event,
		resolve("/api/next/notifications"),
	).then(async (response) => {
		if (response.error) {
			return [];
		}

		return response.json.notifications;
	});

	return { user, notifications };
};
