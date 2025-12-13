import { resolve } from "$app/paths";
import { APIGetPack } from "$lib/server/db/pack.js";
import { fail } from "@sveltejs/kit";

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
