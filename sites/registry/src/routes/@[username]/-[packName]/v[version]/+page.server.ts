import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { approveSchema, dummySchema } from "./schema";
import type { File } from "$lib/api/types.js";
import { error, fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const { username, packName, version } = event.params;

	const parent = await event.parent();

	let readmeFile = undefined;
	const readme = parent.files.find((file) =>
		["readme.md", "readme"].includes(file.path.toLowerCase()),
	);
	if (readme) {
		const response = await requestAPI<File>(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/files/[...path]", {
				username,
				packName,
				version,
				path: readme.path,
			}),
		);
		if (response.error) {
			return error(response.error.status, { message: response.error.message });
		}

		readmeFile = response.json;
	}

	const readmeHTML =
		readmeFile &&
		Bun.markdown
			.html(readmeFile.content, { headings: { ids: true } })
			// Make `/files/` actually take you to the correct file.
			.replace('<a href="files/', `<a href="v${version}/files/`);

	return {
		readme: readmeFile,
		readmeHTML,
	};
};

export const actions = {
	download: async (event) => {
		const { username, packName, version } = event.params;

		const form = await superValidate(event.request, zod4(dummySchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/download", {
				username,
				packName,
				version,
			}),
			{
				method: "POST",
			},
		);
		if (response.error) {
			return message(form, response.error.message, { status: response.error.status as any });
		}

		const filename = response.raw.headers
			.get("Content-Disposition")
			?.split('filename="')[1]
			.split('"')[0];
		if (!filename) {
			return message(form, "Invalid filename found.", { status: 400 });
		}

		const blob = await response.raw.blob();
		return { form, file: await blob.bytes(), filename };
	},
	// TODO: Deduplicate.
	delete: async (event) => {
		const { username, packName, version } = event.params;

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]", {
				username,
				packName,
				version,
			}),
			{
				method: "DELETE",
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}

		// TODO: If there are no more versions, navigate to the homepage.
		redirect(302, resolve("/@[username]/-[packName]", { username, packName }));
	},
	// TODO: Deduplicate.
	approve: async (event) => {
		const { username, packName, version } = event.params;

		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/approve", {
				username,
				packName,
				version,
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
		redirect(
			302,
			resolve("/@[username]/-[packName]/v[version]", {
				username,
				packName,
				version,
			}),
		);
	},
	// TODO: Deduplicate.
	unapprove: async (event) => {
		const { username, packName, version } = event.params;

		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/approve", {
				username,
				packName,
				version,
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
		redirect(
			302,
			resolve("/@[username]/-[packName]/v[version]", {
				username,
				packName,
				version,
			}),
		);
	},
	// TODO: Deduplicate.
	"approve-deny": async (event) => {
		const { username, packName, version } = event.params;

		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/approve/deny", {
				username,
				packName,
				version,
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
		redirect(
			302,
			resolve("/@[username]/-[packName]/v[version]", {
				username,
				packName,
				version,
			}),
		);
	},
	// TODO: Deduplicate.
	"approve-deny-remove": async (event) => {
		const { username, packName, version } = event.params;

		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/approve/deny", {
				username,
				packName,
				version,
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
		redirect(
			302,
			resolve("/@[username]/-[packName]/v[version]", {
				username,
				packName,
				version,
			}),
		);
	},
};
