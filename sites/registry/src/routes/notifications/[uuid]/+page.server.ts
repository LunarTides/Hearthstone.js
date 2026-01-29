import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
	// TODO: Deduplicate.
	delete: async (event) => {
		const uuid = event.params.uuid;

		const response = await requestAPI(
			event,
			resolve("/api/next/notifications/[uuid]", {
				uuid,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		redirect(302, resolve("/notifications"));
	},
};
