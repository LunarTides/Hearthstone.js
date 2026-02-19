import { redirect } from "@sveltejs/kit";
import { superValidate, message, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import schema from "./schema";
import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper";
import type { GroupWithExtras } from "$lib/db/schema";

export const load = async (event) => {
	const clientUser = event.locals.user;
	if (!clientUser || clientUser.username !== event.params.username) {
		return redirect(302, resolve("/"));
	}

	const currentUser = await (await event.parent()).currentUser;

	if (currentUser.ownerType === "User") {
		const form = await superValidate(
			{
				...currentUser.profile,
				role: currentUser.role,
			},
			zod4(schema),
		);
		return { form };
	} else {
		const form = await superValidate(zod4(schema));
		return { form };
	}
};

export const actions = {
	edit: async (event) => {
		const username = event.params.username;

		const form = await superValidate(event.request, zod4(schema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI<{ group: GroupWithExtras }>(
			event,
			resolve("/api/next/@[username]", { username }),
			{
				method: "PUT",
				body: JSON.stringify(form.data),
			},
		);
		if (response.error) {
			return message(form, response.error.message, { status: response.error.status as any });
		}

		return redirect(302, resolve("/@[username]/settings/profile", { username }));
	},
};
