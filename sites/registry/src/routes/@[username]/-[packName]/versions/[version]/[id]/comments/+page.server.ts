import { resolve } from "$app/paths";
import { APIGetPack } from "$lib/server/db/pack";
import { CommentRequest } from "$lib/api/types";
import { requestAPI } from "$lib/api/helper.js";
import { approveSchema, dummySchema } from "$lib/api/schemas.js";
import type { File } from "$lib/api/types.js";
import type { PackCommentWithExtras } from "$lib/db/schema.js";
import type { CensoredPack } from "$lib/pack";
import { error, fail, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

const getComments = async (event: ServerLoadEvent, pack: CensoredPack) => {
	// return error(400, { message: "hi" });
	const response = await requestAPI<PackCommentWithExtras[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/comments", {
			username: pack.ownerName,
			packName: pack.name,
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
	const { username, packName, version, id } = event.params;

	const parent = await event.parent();
	const latest = parent.packs.latest;

	const commentsObject = await getComments(event, latest);

	return {
		commentsObject,
	};
};

export const actions = {
	post: async (event) => {
		const { username, packName } = event.params;

		const packs = await APIGetPack(event.locals.user, username, packName);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const pack = packs.latest;

		const formData = await event.request.formData();
		const text = formData.get("text");

		if (!text) {
			return fail(422, { message: "Invalid form data." });
		}

		const data: CommentRequest = { text: text.valueOf().toString() };

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/comments", {
				username: pack.ownerName,
				packName: pack.name,
			}),
			{
				method: "POST",
				body: JSON.stringify({ ...data }),
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
};
