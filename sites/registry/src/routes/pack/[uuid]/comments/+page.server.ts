import { resolve } from "$app/paths";
import { APIGetPack } from "$lib/server/db/pack";
import { fail } from "@sveltejs/kit";
import { CommentRequest } from "$lib/api/types";

export const actions = {
	post: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.latest;

		const formData = await event.request.formData();
		const text = formData.get("text");

		if (!text) {
			// TODO: i18n
			return fail(422, { message: "Invalid form data." });
		}

		const data: CommentRequest = { text: text.valueOf().toString() };

		const response = await event.fetch(
			resolve("/api/v1/pack/[uuid]/comments", { uuid: version.uuid }),
			{
				method: "POST",
				body: JSON.stringify({ ...data }),
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}
	},
};
