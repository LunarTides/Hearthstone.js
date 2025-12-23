import { resolve } from "$app/paths";
import { satisfiesRole } from "$lib/user";
import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
	const data = await event.parent();

	if (!satisfiesRole(data.user, "Admin")) {
		redirect(303, resolve("/"));
	}
};
