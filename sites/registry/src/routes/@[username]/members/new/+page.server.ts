import { redirect } from "@sveltejs/kit";
import { superValidate, message, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import schema from "./schema";
import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper";

export const load = async (event) => {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return redirect(302, resolve("/"));
	}

	const form = await superValidate(zod4(schema));

	return { form };
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod4(schema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/groups/@[groupName]/members/invite", { groupName: event.params.username }),
			{
				method: "POST",
				body: JSON.stringify(form.data),
			},
		);
		if (response.error) {
			return message(form, response.error.message, { status: response.error.status as any });
		}

		return redirect(302, resolve("/@[username]/members", { username: event.params.username }));
	},
};
