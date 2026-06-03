import { resolve } from "$app/paths";
import type { LayoutParams } from "$app/types";
import { requestAPI } from "$lib/api/helper.js";
import { approveSchema } from "./schema";
import type { FileTree } from "$lib/api/types";
import type { Resource, PackWithExtras } from "$lib/db/schema";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { LayoutRouteId, LayoutServerParentData, RouteId } from "./$types.js";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

const getResources = async (
	event: ServerLoadEvent<LayoutParams<RouteId>, LayoutServerParentData, LayoutRouteId>,
) => {
	const { username, packName, version } = event.params;

	const response = await requestAPI<Resource[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/v[version]/resources", {
			username,
			packName,
			version,
		}),
	);
	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	return response.json;
};

export const load = async (event) => {
	const clientUser = event.locals.user;
	const { username, packName, version } = event.params;

	// TODO: Stream like in `routes/+layout.server.ts`.
	const packResponse = await requestAPI<{ latest: PackWithExtras; outdated: PackWithExtras[] }>(
		event,
		resolve("/api/next/@[username]/-[packName]", { username, packName }),
	);
	if (packResponse.error) {
		return error(packResponse.error.status, { message: packResponse.error.message });
	}

	const { latest, outdated } = packResponse.json;
	const all = [latest, ...outdated];

	const pack = all.find(
		(v) => v.ownerName === username && v.name === packName && v.packVersion === version,
	);
	if (!pack) {
		return error(404, { message: "Pack not found." });
	}

	const formattedPacks = Promise.resolve({ current: pack, latest, all });
	const canEditPack = await isUserMemberOfGroup(clientUser, clientUser?.username, pack.ownerName);

	const fileResponse = await requestAPI<FileTree[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/v[version]/files", {
			username: pack.ownerName,
			packName: pack.name,
			version: pack.packVersion,
		}),
	);
	if (fileResponse.error) {
		return error(fileResponse.error.status, { message: fileResponse.error.message });
	}

	const resources = (await getResources(event)) as Resource[];
	resources.sort((a, b) => {
		if (a.type !== b.type) {
			return a.type.localeCompare(b.type);
		}

		return a.name.localeCompare(b.name);
	});

	const form = await superValidate(zod4(approveSchema));

	return {
		form,
		files: fileResponse.json,
		formattedPacks,
		resources,
		canEditPack,
	};
};
