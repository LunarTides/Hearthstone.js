import { fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import type { Pack } from "$lib/db/schema.js";

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
		const uuid = file.name.split(".").slice(0, -1).join(".");

		const response = await event.fetch(resolve("/api/v1/pack/[uuid]/upload", { uuid }), {
			method: "POST",
			headers: { "Content-Type": "application/octet-stream" },
			body: buffer,
		});

		const json = await response.json();
		if (response.status >= 300) {
			return fail(response.status, { message: json.message });
		}

		const pack = json.pack as Pack;
		redirect(303, resolve("/pack/[uuid]/versions/[version]", { uuid, version: pack.packVersion }));
	},
};
