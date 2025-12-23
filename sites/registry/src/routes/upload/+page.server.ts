import { m } from "$lib/paraglide/messages";
import { fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const file = formData.get("file");
		if (!file) {
			return fail(422, { message: m.supply_file() });
		}

		if (!(file instanceof File)) {
			return fail(422, { message: m.invalid_file() });
		}

		const buffer = await file.arrayBuffer();
		const uuid = file.name.split(".").slice(0, -1).join(".");

		const response = await event.fetch(resolve("/api/v1/pack/upload/[uuid]", { uuid }), {
			method: "POST",
			headers: { "Content-Type": "application/octet-stream" },
			body: buffer,
		});
		if (response.status >= 300) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}

		redirect(303, resolve("/pack/[uuid]", { uuid }));
	},
};
