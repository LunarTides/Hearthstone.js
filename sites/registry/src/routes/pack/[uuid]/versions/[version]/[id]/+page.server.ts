import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { APIGetPack } from "$lib/server/db/pack.js";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
	download: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.all.find((v) => v.id === event.params.id);
		if (!version) {
			return fail(404, { message: "Pack not found." });
		}

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/versions/[version]/[id]/download", {
				uuid: version.uuid,
				version: version.packVersion,
				id: version.id,
			}),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		const filename = response.raw.headers
			.get("Content-Disposition")
			?.split('filename="')[1]
			.split('"')[0];
		if (!filename) {
			return fail(400, { message: "Invalid filename found." });
		}

		const blob = await response.raw.blob();
		return { file: await blob.bytes(), filename };
	},
	// TODO: Deduplicate.
	delete: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.all.find((v) => v.id === event.params.id);
		if (!version) {
			return fail(404, { message: "Pack not found." });
		}

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/versions/[version]/[id]", {
				uuid: version.uuid,
				version: version.packVersion,
				id: version.id,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		// TODO: If there are no more versions, navigate to the homepage.
		redirect(302, resolve("/pack/[uuid]", { uuid: version.uuid }));
	},
	// TODO: Deduplicate.
	approve: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.all.find((v) => v.id === event.params.id);
		if (!version) {
			return fail(404, { message: "Pack not found." });
		}

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/versions/[version]/[id]/approve", {
				uuid: version.uuid,
				version: version.packVersion,
				id: version.id,
			}),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		// TODO: If there are no more versions, navigate to the homepage.
		redirect(302, resolve("/pack/[uuid]", { uuid: version.uuid }));
	},
};
