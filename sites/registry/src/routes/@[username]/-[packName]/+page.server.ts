import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { CensoredPack } from "$lib/pack.js";
import { error, fail, redirect } from "@sveltejs/kit";

export const load = async (event) => {
	const { username, packName } = event.params;

	const packResponse = await requestAPI<{ latest: CensoredPack; outdated: CensoredPack[] }>(
		event,
		resolve("/api/next/@[username]/-[packName]", {
			username,
			packName,
		}),
	);
	if (packResponse.error) {
		error(packResponse.error.status, { message: packResponse.error.message });
	}

	const { latest } = packResponse.json;

	// Navigate to the latest version of the pack.
	redirect(
		302,
		resolve("/@[username]/-[packName]/v[version]", {
			username,
			packName,
			version: latest.packVersion,
		}),
	);
};

export const actions = {
	like: async (event) => {
		const { username, packName } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/like", { username, packName }),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
	// TODO: Deduplicate.
	dislike: async (event) => {
		const { username, packName } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/dislike", { username, packName }),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
	// TODO: Deduplicate.
	delete: async (event) => {
		const { username, packName } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]", {
				username,
				packName,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		redirect(302, resolve("/"));
	},
};
