import { redirect, type RequestEvent } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { superValidate, message, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import schema from "./schema";
import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper";

export const load: PageServerLoad = async (event) => {
	// If the user is already logged in, take them to the home menu.
	if (event.locals.user) {
		return redirect(302, resolve("/"));
	}

	const form = await superValidate(zod4(schema));

	return { form };
};

const request = async (event: RequestEvent, url: string) => {
	const form = await superValidate(event.request, zod4(schema));
	if (!form.valid) {
		return fail(400, { form });
	}

	const response = await requestAPI<{}>(event, url, {
		method: "POST",
		body: JSON.stringify(form.data),
	});
	if (response.error) {
		return message(form, response.error.message, { status: response.error.status as any });
	}

	return redirect(302, resolve("/"));
};

export const actions: Actions = {
	login: async (event) => {
		return request(event, resolve("/api/next/user/login"));
	},
	register: async (event) => {
		return request(event, resolve("/api/next/user/register"));
	},
};
