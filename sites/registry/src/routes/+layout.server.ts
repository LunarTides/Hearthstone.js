import { resolve } from "$app/paths";
import type { Notification } from "$lib/db/schema";

export const load = async (event) => {
	const user = event.locals.user;

	const notifications = event.fetch(resolve("/api/v1/notifications")).then(async (response) => {
		const json = await response.json();
		if (response.status !== 200) {
			return [];
		}

		return json.notifications as Notification[];
	});

	return { user, notifications };
};
