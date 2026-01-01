import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { APIGetPack } from "$lib/server/db/pack";
import { fail } from "@sveltejs/kit";

export const actions = {
	like: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.latest;
		const commentId = event.params.commentId;

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/comments/[commentId]/like", { uuid: version.uuid, commentId }),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
	dislike: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.latest;
		const commentId = event.params.commentId;

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/comments/[commentId]/dislike", {
				uuid: version.uuid,
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
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.latest;
		const commentId = event.params.commentId;

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/comments/[commentId]/heart", { uuid: version.uuid, commentId }),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
	unheart: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.latest;
		const commentId = event.params.commentId;

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/comments/[commentId]/heart", {
				uuid: version.uuid,
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
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const version = packs.latest;
		const commentId = event.params.commentId;

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/comments/[commentId]", {
				uuid: version.uuid,
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
