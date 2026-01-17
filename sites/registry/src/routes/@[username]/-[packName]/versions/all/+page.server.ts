import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
	// TODO: Deduplicate.
	delete: async (event) => {
		const { username, packName } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/v1/@[username]/-[packName]", {
				username,
				packName,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		redirect(302, resolve("/"));
	},
};
