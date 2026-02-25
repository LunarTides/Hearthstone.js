import { redirect } from "@sveltejs/kit";
import { superValidate, message, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { postTokenSchema } from "./schema";
import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper";
import type { CensoredGradualToken } from "$lib/token";

export const load = async (event) => {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return redirect(302, resolve("/"));
	}

	const username = event.params.username;
	const createTokenForm = await superValidate(zod4(postTokenSchema));

	// TODO: Stream
	const response = await requestAPI<{ tokens: CensoredGradualToken[] }>(
		event,
		resolve("/api/next/@[username]/tokens", { username }),
	);
	if (response.error) {
		return message(createTokenForm, response.error.message, {
			status: response.error.status as any,
		});
	}

	const tokens = response.json.tokens;

	return { createTokenForm, tokens };
};

export const actions = {
	createToken: async (event) => {
		const username = event.params.username;

		const form = await superValidate(event.request, zod4(postTokenSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI<{ token: string }>(
			event,
			resolve("/api/next/@[username]/tokens", { username }),
			{
				method: "POST",
				body: JSON.stringify(form.data),
			},
		);
		if (response.error) {
			return message(form, response.error.message, { status: response.error.status as any });
		}

		return message(
			form,
			`msg:The token is: '${response.json.token}' (Without the apostrophes.) This will only show once, so copy and paste the token to a safe place.`,
		);

		// return redirect(302, resolve("/@[username]/settings/auth", { username }));
	},
};
