import { resolve } from "$app/paths";
import type { FileTree } from "$lib/api/types.js";
import { m } from "$lib/paraglide/messages.js";
import { APIGetPack } from "$lib/server/db/pack.js";
import { fail, redirect } from "@sveltejs/kit";

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
		resolve("/api/v1/pack/[uuid]/[version]/files", {
			uuid: version.uuid,
			version: version.id,
		}),
	);

	const json = await response.json();
	if (response.status !== 200) {
		return fail(response.status, { message: json.message });
	}

	return { files: json as FileTree[] };
};

export const actions = {
	download: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.all.find((v) => v.packVersion === event.params.version);
		if (!version) {
			return fail(404, { message: m.pack_not_found() });
		}

		const response = await event.fetch(
			resolve("/api/v1/pack/[uuid]/[version]/download", {
				uuid: version.uuid,
				version: version.id,
			}),
			{
				method: "POST",
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}

		const filename = response.headers
			.get("Content-Disposition")
			?.split('filename="')[1]
			.split('"')[0];
		if (!filename) {
			return fail(400, { message: m.terrible_pool_weapon_pot() });
		}

		const blob = await response.blob();
		return { file: await blob.bytes(), filename };
	},
	// TODO: Deduplicate.
	delete: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.all.find((v) => v.packVersion === event.params.version);
		if (!version) {
			return fail(404, { message: m.pack_not_found() });
		}

		const response = await event.fetch(
			resolve("/api/v1/pack/[uuid]/[version]", {
				uuid: version.uuid,
				version: version.id,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}

		redirect(302, resolve("/pack/[uuid]", { uuid: version.uuid }));
	},
};
