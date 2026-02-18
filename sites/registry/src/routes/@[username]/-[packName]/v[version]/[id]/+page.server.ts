import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import { approveSchema, dummySchema } from "$lib/api/schemas.js";
import type { File } from "$lib/api/types.js";
import { APIGetPack } from "$lib/server/db/pack.js";
import { error, fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const { username, packName, version, id } = event.params;

	const parent = await event.parent();

	let readmeFile = undefined;
	const readme = parent.files.find((file) =>
		["readme.md", "readme"].includes(file.path.toLowerCase()),
	);
	if (readme) {
		const response = await requestAPI<File>(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/[id]/files/[...path]", {
				username,
				packName,
				version,
				id,
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
			.html(readmeFile.content, { headingIds: true })
			// Make `/files/` actually take you to the correct file.
			.replace('<a href="files/', `<a href="${event.params.id}/files/`);

	return {
		readme: readmeFile,
		readmeHTML,
	};
};

export const actions = {
	download: async (event) => {
		const { username, packName, version, id } = event.params;

		const form = await superValidate(event.request, zod4(dummySchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// TODO: Get single pack instead of all packs.
		const packs = await APIGetPack(event.locals.user, username, packName);
		if (packs.error) {
			return message(form, packs.error.message, { status: packs.error.status as any });
		}

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return message(form, "Pack not found.", { status: 404 });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/[id]/download", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
				id: pack.id,
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
		const { username, packName, version, id } = event.params;

		// TODO: Only get 1 pack.
		const packs = await APIGetPack(event.locals.user, username, packName);
		if (packs.error) {
			return fail(packs.error.status, { message: packs.error.message });
		}

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return fail(404, { message: "Pack not found." });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/[id]", {
				username: pack.ownerName,
				packName: pack.name,
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
		redirect(302, resolve("/@[username]/-[packName]", { username, packName }));
	},
	// TODO: Deduplicate.
	approve: async (event) => {
		const { username, packName, version, id } = event.params;

		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// TODO: Only get 1 pack.
		const packs = await APIGetPack(event.locals.user, username, packName);
		if (packs.error) {
			return message(form, packs.error.message, { status: packs.error.status as any });
		}

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return message(form, "Pack not found.", { status: 404 });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/[id]/approve", {
				username: pack.ownerName,
				packName: pack.name,
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
		redirect(
			302,
			resolve("/@[username]/-[packName]/v[version]/[id]", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
				id: pack.id,
			}),
		);
	},
	// TODO: Deduplicate.
	unapprove: async (event) => {
		const { username, packName, version, id } = event.params;

		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// TODO: Only get 1 pack.
		const packs = await APIGetPack(event.locals.user, username, packName);
		if (packs.error) {
			return message(form, packs.error.message, { status: packs.error.status as any });
		}

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return message(form, "Pack not found.", { status: 404 });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/[id]/approve", {
				username: pack.ownerName,
				packName: pack.name,
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
		redirect(
			302,
			resolve("/@[username]/-[packName]/v[version]/[id]", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
				id: pack.id,
			}),
		);
	},
	// TODO: Deduplicate.
	"approve-deny": async (event) => {
		const { username, packName, version, id } = event.params;

		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// TODO: Only get 1 pack.
		const packs = await APIGetPack(event.locals.user, username, packName);
		if (packs.error) {
			return message(form, packs.error.message, { status: packs.error.status as any });
		}

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return message(form, "Pack not found.", { status: 404 });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/[id]/approve/deny", {
				username: pack.ownerName,
				packName: pack.name,
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
		redirect(
			302,
			resolve("/@[username]/-[packName]/v[version]/[id]", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
				id: pack.id,
			}),
		);
	},
	// TODO: Deduplicate.
	"approve-deny-remove": async (event) => {
		const { username, packName, version, id } = event.params;

		const form = await superValidate(event.request, zod4(approveSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// TODO: Only get 1 pack.
		const packs = await APIGetPack(event.locals.user, username, packName);
		if (packs.error) {
			return message(form, packs.error.message, { status: packs.error.status as any });
		}

		const pack = packs.all.find((v) => v.id === event.params.id);
		if (!pack) {
			return message(form, "Pack not found.", { status: 404 });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/[id]/approve/deny", {
				username: pack.ownerName,
				packName: pack.name,
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
		redirect(
			302,
			resolve("/@[username]/-[packName]/v[version]/[id]", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
				id: pack.id,
			}),
		);
	},
};
