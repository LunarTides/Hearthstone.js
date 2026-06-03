import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { requestAPI } from "$lib/api/helper";
import { resolve } from "$app/paths";
import type { File } from "$lib/api/types";
import type { Resource, CommentWithExtras } from "$lib/db/schema.js";
import type { CensoredPack } from "$lib/pack.js";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { postSchema } from "../../comments/schema.js";

const getComments = async (event: ServerLoadEvent, filePath: string) => {
	// TODO: Support pagination.
	const response = await requestAPI<CommentWithExtras[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/comments", {
			username: event.params.username!,
			packName: event.params.packName!,
		}) + `?filePath=${filePath}`,
	);

	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	const amount = parseInt(response.raw.headers.get("X-Comment-Amount")!, 10);

	return { comments: response.json, amount };
};

const getResources = async (event: ServerLoadEvent) => {
	const { username, packName, version, uuid } = event.params;

	const resourceResponse = await requestAPI<{
		latest: {
			resource: Resource;
			pack: CensoredPack;
		};
		outdated: {
			resource: Resource;
			pack: CensoredPack;
		}[];
	}>(
		event,
		resolve("/api/next/resources/all/[uuid]", {
			uuid: uuid!,
		}),
	);
	if (resourceResponse.error) {
		return error(resourceResponse.error.status, { message: resourceResponse.error.message });
	}

	const resources = resourceResponse.json;
	const currentResource = [resources.latest, ...resources.outdated].find(
		(c) =>
			c.pack.ownerName === username && c.pack.name === packName && c.pack.packVersion === version,
	);
	if (!currentResource) {
		return error(404, { message: "This resource doesn't exist." });
	}

	const fileResponse = await requestAPI<File>(
		event,
		resolve("/api/next/@[username]/-[packName]/v[version]/files/[...path]", {
			username: currentResource.pack.ownerName,
			packName: currentResource.pack.name,
			version: currentResource.pack.packVersion,
			// Remove leading slash.
			path: currentResource.resource.filePath.replace(/^\//, ""),
		}),
	);
	if (fileResponse.error) {
		return error(fileResponse.error.status, { message: fileResponse.error.message });
	}

	return {
		packs: {
			latest: resources.latest.pack,
			all: [resources.latest, ...resources.outdated].map((c) => c.pack),
		},
		latest: resources.latest.resource,
		all: [resources.latest, ...resources.outdated].map((c) => c.resource),
		file: fileResponse.json,
		current: currentResource.resource,
		currentPack: currentResource.pack,
	};
};

export const load = async (event) => {
	// TODO: Make this proper async.
	const form = await superValidate(zod4(postSchema));
	const relevantResources = await getResources(event);
	const commentsObject = await getComments(event, relevantResources.current.filePath);

	return {
		form,
		relevantResources: relevantResources,
		commentsObject,
	};
};
