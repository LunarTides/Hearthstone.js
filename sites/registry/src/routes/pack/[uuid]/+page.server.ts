import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { PackCommentWithExtras } from "$lib/db/schema";
import type { CensoredPack } from "$lib/pack.js";
import { APIGetPack, loadGetPack } from "$lib/server/db/pack.js";
import { error, fail, redirect, type ServerLoadEvent } from "@sveltejs/kit";

export const load = async (event) => {
	const packs = await loadGetPack(event.locals.user, event.params.uuid);
	const latest = packs.latest;

	redirect(
		302,
		resolve("/pack/[uuid]/versions/[version]/[id]", {
			uuid: event.params.uuid,
			version: latest.packVersion,
			id: latest.id,
		}),
	);
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
