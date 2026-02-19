import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { CommentWithExtras } from "$lib/db/schema.js";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { superValidate, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { postSchema } from "./schema";

const getComments = async (event: ServerLoadEvent) => {
	// TODO: Support pagination.
	const response = await requestAPI<CommentWithExtras[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/comments", {
			username: event.params.username!,
			packName: event.params.packName!,
		}),
	);

	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	const amount = parseInt(response.raw.headers.get("X-Comment-Amount")!, 10);

	return { comments: response.json, amount };
};

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const form = await superValidate(zod4(postSchema));
	const commentsObject = await getComments(event);

	return {
		form,
		commentsObject,
	};
};

export const actions = {
	post: async (event) => {
		const { username, packName, version } = event.params;

		const form = await superValidate(event.request, zod4(postSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/comments", {
				username,
				packName,
				version,
			}),
			{
				method: "POST",
				body: JSON.stringify(form.data),
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		return { form };
	},
};
