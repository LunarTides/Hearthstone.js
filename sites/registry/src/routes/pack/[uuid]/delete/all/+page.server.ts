import { resolve } from "$app/paths";
import { APIGetPack } from "$lib/server/db/pack";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
	// TODO: Deduplicate.
	default: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const pack = packs.latest;

		const response = await event.fetch(
			resolve("/api/v1/pack/[uuid]", {
				uuid: pack.uuid,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}

		redirect(302, "/");
	},
};
