import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { approveSchema } from "$lib/api/schemas.js";
import { APIGetPack } from "$lib/server/db/pack.js";
import { fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const actions = {
	download: async (event) => {
		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return fail(404, { message: "Pack not found." });
		}

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/versions/[version]/[id]/download", {
				uuid: pack.uuid,
				version: pack.packVersion,
				id: pack.id,
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

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return fail(404, { message: "Pack not found." });
		}

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/versions/[version]/[id]", {
				uuid: pack.uuid,
				version: pack.packVersion,
				id: pack.id,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		// TODO: If there are no more versions, navigate to the homepage.
		redirect(302, resolve("/pack/[uuid]", { uuid: pack.uuid }));
	},
	// TODO: Deduplicate.
	approve: async (event) => {
		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return message(form, packs.error.message, { status: packs.error.status as any });
		}

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return message(form, "Pack not found.", { status: 404 });
		}

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/versions/[version]/[id]/approve", {
				uuid: pack.uuid,
				version: pack.packVersion,
				id: pack.id,
			}),
			{
				method: "POST",
				body: JSON.stringify(form.data),
			},
		);
		if (response.error) {
			return message(form, response.error.message, { status: response.error.status as any });
		}

		// TODO: If there are no more versions, navigate to the homepage.
		redirect(302, resolve("/pack/[uuid]", { uuid: pack.uuid }));
	},
	// TODO: Deduplicate.
	unapprove: async (event) => {
		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const packs = await APIGetPack(event.locals.user, event.params.uuid);
		if (packs.error) {
			return message(form, packs.error.message, { status: packs.error.status as any });
		}

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return message(form, "Pack not found.", { status: 404 });
		}

		const response = await requestAPI(
			event,
			resolve("/api/v1/pack/[uuid]/versions/[version]/[id]/approve", {
				uuid: pack.uuid,
				version: pack.packVersion,
				id: pack.id,
			}),
			{
				method: "DELETE",
				body: JSON.stringify(form.data),
			},
		);
		if (response.error) {
			return message(form, response.error.message, { status: response.error.status as any });
		}

		// TODO: If there are no more versions, navigate to the homepage.
		redirect(302, resolve("/pack/[uuid]", { uuid: pack.uuid }));
	},
};
