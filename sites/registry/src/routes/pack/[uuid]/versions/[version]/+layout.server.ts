import { resolve } from "$app/paths";
import type { FileTree } from "$lib/api/types";
import { m } from "$lib/paraglide/messages";
import { APIGetPack } from "$lib/server/db/pack";
import { fail } from "assert";

export const load = async (event) => {
	const packs = await APIGetPack(event.locals.user, event.params.uuid);
	if (packs.error) {
		return fail(packs.error.status, { message: packs.error.message });
	}

	const version = packs.all.find((v) => v.packVersion === event.params.version);
	if (!version) {
		return fail(404, { message: m.pack_not_found() });
	}

	const response = await event.fetch(
		resolve("/api/v1/pack/[uuid]/versions/[version]/files", {
			uuid: version.uuid,
			version: version.packVersion,
		}),
	);

	const json = await response.json();
	if (response.status !== 200) {
		return fail(response.status, { message: json.message });
	}

	return { files: json as FileTree[] };
};
