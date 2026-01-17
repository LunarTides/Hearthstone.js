import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { APIGetPack } from "$lib/server/db/pack";
import { fail } from "@sveltejs/kit";

export const actions = {
	like: async (event) => {
		const { username, packName, commentId } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/v1/@[username]/-[packName]/comments/[commentId]/like", {
				username,
				packName,
				commentId,
			}),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
	dislike: async (event) => {
		const { username, packName, commentId } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/v1/@[username]/-[packName]/comments/[commentId]/dislike", {
				username,
				packName,
				commentId,
			}),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
	heart: async (event) => {
		const { username, packName, commentId } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/v1/@[username]/-[packName]/comments/[commentId]/heart", {
				username,
				packName,
				commentId,
			}),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
	unheart: async (event) => {
		const { username, packName, commentId } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/v1/@[username]/-[packName]/comments/[commentId]/heart", {
				username,
				packName,
				commentId,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
	// TODO: Deduplicate.
	delete: async (event) => {
		const { username, packName, commentId } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/v1/@[username]/-[packName]/comments/[commentId]", {
				username,
				packName,
				commentId,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
};
