import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { FileTree } from "$lib/api/types";
import { APIGetPack } from "$lib/server/db/pack";
import { fail } from "@sveltejs/kit";

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const packs = await APIGetPack(event.locals.user, event.params.uuid);
	if (packs.error) {
		return fail(packs.error.status, { message: packs.error.message });
	}

	const version = packs.all.find((v) => v.packVersion === event.params.version);
	if (!version) {
		return fail(404, { message: "Pack not found." });
	}

	const response = await requestAPI<FileTree[]>(
		event,
		resolve("/api/v1/pack/[uuid]/versions/[version]/files", {
			uuid: version.uuid,
			version: version.packVersion,
		}),
	);
	if (response.error) {
		return fail(response.error.status, { message: response.error.message });
	}

	return { files: response.json };
};
