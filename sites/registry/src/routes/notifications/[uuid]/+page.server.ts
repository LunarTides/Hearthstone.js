import { resolve } from "$app/paths";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
	// TODO: Deduplicate.
	delete: async (event) => {
		const uuid = event.params.uuid;

		const response = await event.fetch(
			resolve("/api/v1/notifications/[uuid]", {
				uuid,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}

		redirect(302, resolve("/notifications"));
	},
};
