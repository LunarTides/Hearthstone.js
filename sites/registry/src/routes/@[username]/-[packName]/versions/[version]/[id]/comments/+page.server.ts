import { resolve } from "$app/paths";
import { CommentRequest } from "$lib/api/types";
import { requestAPI } from "$lib/api/helper.js";
import type { PackCommentWithExtras } from "$lib/db/schema.js";
import type { CensoredPack } from "$lib/pack";
import { error, fail, type ServerLoadEvent } from "@sveltejs/kit";

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
	const parent = await event.parent();
	const latest = parent.packs.latest;

	const commentsObject = await getComments(event, latest);

	return {
		commentsObject,
	};
};

export const actions = {
	post: async (event) => {
		const { username, packName, version, id } = event.params;

		const formData = await event.request.formData();
		const text = formData.get("text");

		if (!text) {
			return fail(422, { message: "Invalid form data." });
		}

		const data: CommentRequest = { text: text.valueOf().toString() };

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/versions/[version]/[id]/comments", {
				username,
				packName,
				version,
				id,
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
