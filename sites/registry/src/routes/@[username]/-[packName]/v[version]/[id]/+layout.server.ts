import { resolve } from "$app/paths";
import type { LayoutParams } from "$app/types";
import { requestAPI } from "$lib/api/helper.js";
import { approveSchema } from "$lib/api/schemas.js";
import type { FileTree } from "$lib/api/types";
import type { Card } from "$lib/db/schema";
import { APIGetPack } from "$lib/server/db/pack";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { LayoutRouteId, LayoutServerParentData, RouteId } from "./$types.js";

const getCards = async (
	event: ServerLoadEvent<LayoutParams<RouteId>, LayoutServerParentData, LayoutRouteId>,
) => {
	const { username, packName, version, id } = event.params;

	const response = await requestAPI<Card[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/v[version]/[id]/cards", {
			username,
			packName,
			version,
			id,
		}),
	);
	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	return response.json;
};

export const load = async (event) => {
	const { username, packName, version, id } = event.params;

	// TODO: Stream like in `routes/+layout.server.ts`.
	// TODO: Only get 1 pack.
	const packs = await APIGetPack(event.locals.user, username, packName);
	if (packs.error) {
		return error(packs.error.status, { message: packs.error.message });
	}

	const pack = packs.all.find((v) => v.id === event.params.id);
	if (!pack) {
		return error(404, { message: "Pack not found." });
	}

	const formattedPacks = Promise.resolve({ current: pack, latest: packs.latest, all: packs.all });
	// TODO: Account for groups.
	const canEditPack = pack.ownerName === event.locals.user?.username;

	const fileResponse = await requestAPI<FileTree[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/v[version]/[id]/files", {
			username: pack.ownerName,
			packName: pack.name,
			version: pack.packVersion,
			id: pack.id,
		}),
	);
	if (fileResponse.error) {
		return error(fileResponse.error.status, { message: fileResponse.error.message });
	}

	const cards = await getCards(event);
	const form = await superValidate(zod4(approveSchema));

	return {
		form,
		files: fileResponse.json,
		formattedPacks,
		cards,
		canEditPack,
	};
};
