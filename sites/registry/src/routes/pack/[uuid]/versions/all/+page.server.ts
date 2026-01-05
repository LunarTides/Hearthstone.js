import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { APIGetPack } from "$lib/server/db/pack";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
	// TODO: Deduplicate.
	delete: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const pack = packs.latest;

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]", {
				uuid: pack.uuid,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		redirect(302, "/");
	},
};
