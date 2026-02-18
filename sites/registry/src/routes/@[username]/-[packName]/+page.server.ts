import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { loadGetPack } from "$lib/server/db/pack.js";
import { fail, redirect } from "@sveltejs/kit";

export const load = async (event) => {
	const packs = await loadGetPack(event.locals.user, event.params.username, event.params.packName);
	const latest = packs.latest;

	redirect(
		302,
		resolve("/@[username]/-[packName]/v[version]", {
			username: event.params.username,
			packName: event.params.packName,
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
