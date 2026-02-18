import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { Setting } from "$lib/db/schema.js";
import { fail, redirect } from "@sveltejs/kit";

export const load = async (event) => {
	const settings = requestAPI<{ settings: Setting[] }>(
		event,
		resolve("/api/next/moderation/settings"),
	).then(async (response) => {
		if (response.error) {
			return [];
		}

		return response.json.settings.toSorted((a, b) => a.key.localeCompare(b.key));
	});

	return { settings };
};

export const actions = {
	save: async (event) => {
		const form = await event.request.formData();
		const raw = form.get("settings");
		let settings = null;

		try {
			settings = JSON.parse((raw ?? "").toString());
		} catch {}

		if (!raw || settings === null) {
			return fail(400, { message: "Invalid settings object." });
		}

		const response = await requestAPI(event, resolve("/api/next/moderation/settings"), {
			method: "POST",
			body: JSON.stringify({ settings }),
		});
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		redirect(302, resolve("/dashboard/admin/settings"));
	},
};
