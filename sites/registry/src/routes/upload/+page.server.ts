import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import type { Pack } from "$lib/db/schema.js";
import { requestAPI } from "$lib/api/helper.js";
import { uploadSchema } from "$lib/api/schemas";
import { superValidate, fail, message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load = async (event) => {
	const form = await superValidate(zod4(uploadSchema));

	return { form };
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod4(uploadSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const file = form.data.file;

		const buffer = await file.arrayBuffer();
		const [username, packName] = file.name.split(".").slice(0, -2).join(".").split("+");

		const response = await requestAPI<{ pack: Pack }>(
			event,
			resolve("/api/v1/@[username]/-[packName]/upload", { username, packName }),
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
			resolve("/@[username]/-[packName]/versions/[version]/[id]", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
				id: pack.id,
			}),
		);
	},
};
