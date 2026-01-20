import { resolve } from "$app/paths";
import { APIGetPack } from "$lib/server/db/pack";
import { fail } from "@sveltejs/kit";
import { CommentRequest } from "$lib/api/types";
import { requestAPI } from "$lib/api/helper.js";

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
			resolve("/api/v1/@[username]/-[packName]/comments", {
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
