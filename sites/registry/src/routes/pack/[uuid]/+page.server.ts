import { resolve } from "$app/paths";
import type { PackCommentWithExtras } from "$lib/db/schema";
import type { CensoredPack } from "$lib/pack.js";
import { APIGetPack, loadGetPack } from "$lib/server/db/pack.js";
import { error, fail, type ServerLoadEvent } from "@sveltejs/kit";

const getComments = async (event: ServerLoadEvent, version: CensoredPack) => {
	// return error(400, { message: "hi" });
	const response = await event.fetch(
		resolve("/api/v1/pack/[uuid]/comments", { uuid: version.uuid }),
	);

	const json = await response.json();
	if (response.status !== 200) {
		return error(response.status, { message: json.message });
	}

	const amount = parseInt(response.headers.get("X-Comment-Amount")!, 10);

	return { comments: json as PackCommentWithExtras[], amount };
};

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const packs = await loadGetPack(event.locals.user, event.params.uuid);
	const version = packs.latest;

	const commentsObject = await getComments(event, version);

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

		const version = packs.latest;

		const response = await event.fetch(
			resolve("/api/v1/pack/[uuid]/like", { uuid: version.uuid }),
			{
				method: "POST",
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}
	},
	// TODO: Deduplicate.
	dislike: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.latest;

		const response = await event.fetch(
			resolve("/api/v1/pack/[uuid]/dislike", { uuid: version.uuid }),
			{
				method: "POST",
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}
	},
};
