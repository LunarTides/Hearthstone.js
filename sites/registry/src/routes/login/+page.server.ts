import { fail, redirect, type RequestEvent } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { superValidate, setError } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { loginSchema } from "$lib/api/schemas";
import { resolve } from "$app/paths";

export const load: PageServerLoad = async (event) => {
	// If the user is already logged in, take them to the home menu.
	if (event.locals.user) {
		return redirect(302, "/");
	}

	const form = await superValidate(zod4(loginSchema));

	return { form };
};

const request = async (event: RequestEvent, url: string) => {
	const form = await superValidate(event.request, zod4(loginSchema));
	if (!form.valid) {
		return fail(400, { form });
	}

	const response = await event.fetch(url, {
		method: "POST",
		body: JSON.stringify(form.data),
	});
	if (response.status >= 300) {
		const json = await response.json();
		return setError(form, json.message, { status: response.status });
	}

	return redirect(302, "/");
};

export const actions: Actions = {
	login: async (event) => {
		return request(event, resolve("/api/v1/user/login"));
	},
	register: async (event) => {
		return request(event, resolve("/api/v1/user/register"));
	},
};
