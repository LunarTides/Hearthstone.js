import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import type { Pack } from "$lib/db/schema.js";
import { requestAPI } from "$lib/api/helper.js";
import { uploadSchema } from "$lib/api/schemas";
import { superValidate, fail, message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { CensoredGroup } from "$lib/group.js";

export const load = async (event) => {
	// TODO: Do this more places that require logging in.
	const clientUser = event.locals.user;
	if (!clientUser) {
		redirect(303, resolve("/"));
	}

	const form = await superValidate(zod4(uploadSchema));

	// TODO: Stream.
	const response = await requestAPI<{ groups: CensoredGroup[] }>(
		event,
		resolve("/api/next/groups/user/@[username]/can-upload-to", { username: clientUser.username }),
	);
	if (response.error) {
		return message(form, response.error.message, { status: response.error.status as any });
	}

	const validGroups = response.json.groups;

	return { form, validGroups };
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod4(uploadSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const file = form.data.file;

		const buffer = await file.arrayBuffer();
		const { ownerName, packName } = form.data;

		const response = await requestAPI<{ pack: Pack }>(
			event,
			resolve("/api/next/@[username]/-[packName]/upload", { username: ownerName, packName }),
			{
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: buffer,
			},
		);
		if (response.error) {
			return message(form, response.error.message, { status: response.error.status as any });
		}

		const pack = response.json.pack;
		redirect(
			303,
			resolve("/@[username]/-[packName]/v[version]/[id]", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
				id: pack.id,
			}),
		);

		// NOTE: This is needed for some reason? Without this, it doesn't redirect properly...
		return { form };
	},
};
