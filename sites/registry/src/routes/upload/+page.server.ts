import { m } from "$lib/paraglide/messages";
import { fail } from "@sveltejs/kit";
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

		const response = await event.fetch(
			resolve("/api/v1/pack/upload/[filename]", { filename: file.name }),
			{
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: buffer,
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}
	},
};
