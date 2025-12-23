import { resolve } from "$app/paths";
import { APIGetPack } from "$lib/server/db/pack.js";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
	download: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.all.find((v) => v.packVersion === event.params.version);
		if (!version) {
			return fail(404, { message: "Pack not found." });
		}

		const response = await event.fetch(
			resolve("/api/v1/pack/[uuid]/versions/[version]/download", {
				uuid: version.uuid,
				version: version.packVersion,
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
			return fail(400, { message: "Invalid filename found." });
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
			return fail(404, { message: "Pack not found." });
		}

		const response = await event.fetch(
			resolve("/api/v1/pack/[uuid]/versions/[version]", {
				uuid: version.uuid,
				version: version.packVersion,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
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

		const version = packs.all.find((v) => v.packVersion === event.params.version);
		if (!version) {
			return fail(404, { message: "Pack not found." });
		}

		const response = await event.fetch(
			resolve("/api/v1/pack/[uuid]/versions/[version]/approve", {
				uuid: version.uuid,
				version: version.packVersion,
			}),
			{
				method: "POST",
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}

		// TODO: If there are no more versions, navigate to the homepage.
		redirect(302, resolve("/pack/[uuid]", { uuid: version.uuid }));
	},
};
