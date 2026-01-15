import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { PackCommentWithExtras } from "$lib/db/schema";
import type { CensoredPack } from "$lib/pack.js";
import { APIGetPack, loadGetPack } from "$lib/server/db/pack.js";
import { error, fail, type ServerLoadEvent } from "@sveltejs/kit";

const getComments = async (event: ServerLoadEvent, pack: CensoredPack) => {
	// return error(400, { message: "hi" });
	const response = await requestAPI<PackCommentWithExtras[]>(
		event,
		resolve("/api/v1/pack/[uuid]/comments", { uuid: pack.uuid }),
	);

	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	const amount = parseInt(response.raw.headers.get("X-Comment-Amount")!, 10);

	return { comments: response.json, amount };
};

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const packs = await loadGetPack(event.locals.user, event.params.uuid);
	const latest = packs.latest;

	const commentsObject = await getComments(event, latest);

	return {
		commentsObject,
	};
};

export const actions = {
	like: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const pack = packs.latest;

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/like", { uuid: pack.uuid }),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
	// TODO: Deduplicate.
	dislike: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const pack = packs.latest;

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/dislike", { uuid: pack.uuid }),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
};
