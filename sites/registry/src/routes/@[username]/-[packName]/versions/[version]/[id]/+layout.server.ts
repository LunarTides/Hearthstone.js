import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { approveSchema } from "$lib/api/schemas.js";
import type { FileTree } from "$lib/api/types";
import { APIGetPack } from "$lib/server/db/pack";
import { error } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load = async (event) => {
	const { username, packName, version, id } = event.params;

	// TODO: Stream like in `routes/+layout.server.ts`.
	// TODO: Only get 1 pack.
	const packs = await APIGetPack(event.locals.user, username, packName);
	if (packs.error) {
		return error(packs.error.status, { message: packs.error.message });
	}

	const pack = packs.all.find((v) => v.id === event.params.id);
	if (!pack) {
		return error(404, { message: "Pack not found." });
	}

	const response = await requestAPI<FileTree[]>(
		event,
		resolve("/api/v1/@[username]/-[packName]/versions/[version]/[id]/files", {
			username: pack.ownerName,
			packName: pack.name,
			version: pack.packVersion,
			id: pack.id,
		}),
	);
	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	const form = await superValidate(zod4(approveSchema));

	return { form, files: response.json };
};
