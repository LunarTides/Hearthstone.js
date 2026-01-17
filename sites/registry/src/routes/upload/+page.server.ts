import { fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import type { Pack } from "$lib/db/schema.js";
import { requestAPI } from "$lib/api/helper.js";

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const file = formData.get("file");
		if (!file) {
			return fail(422, { message: "Please supply a file." });
		}

		if (!(file instanceof File)) {
			return fail(422, { message: "Invalid file." });
		}

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
			return fail(response.error.status, { message: response.error.message });
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
