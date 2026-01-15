import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { approveSchema } from "$lib/api/schemas.js";
import type { FileTree } from "$lib/api/types";
import { APIGetPack } from "$lib/server/db/pack";
import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const packs = await APIGetPack(event.locals.user, event.params.uuid);
	if (packs.error) {
		return fail(packs.error.status, { message: packs.error.message });
	}

	const pack = packs.all.find((v) => v.id === event.params.id);
	if (!pack) {
		return fail(404, { message: "Pack not found." });
	}

	const response = await requestAPI<FileTree[]>(
		event,
		resolve("/api/v1/pack/[uuid]/versions/[version]/[id]/files", {
			uuid: pack.uuid,
			version: pack.packVersion,
			id: pack.id,
		}),
	);
	if (response.error) {
		return fail(response.error.status, { message: response.error.message });
	}

	const form = await superValidate(zod4(approveSchema));

	return { form, files: response.json };
};
