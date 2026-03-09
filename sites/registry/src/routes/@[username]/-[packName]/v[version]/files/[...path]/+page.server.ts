import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { File, FileTree } from "$lib/api/types";
import type { CommentWithExtras } from "$lib/db/schema";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { postSchema } from "../../comments/schema";

const getRelevantFile = (
	files: FileTree[] | undefined,
	path: string | undefined,
): FileTree | undefined => {
	if (!files || !path) {
		return;
	}

	const file = files.find((f) => f.path === path);
	if (file) {
		return file;
	}

	// Find file in children.
	for (const f of files) {
		if (!f.children) {
			continue;
		}

		const foundFile = getRelevantFile(f.children, path);
		if (foundFile) {
			return foundFile;
		}
	}
};

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

export const load = async (event) => {
	const { username, packName, version, path } = event.params;

	// TODO: Stream like in `routes/+layout.server.ts`.
	const response = await requestAPI<File>(
		event,
		resolve("/api/next/@[username]/-[packName]/v[version]/files/[...path]", {
			username,
			packName,
			version,
			path,
		}),
	);
	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	const form = await superValidate(zod4(postSchema));
	const commentsObject = await getComments(event, event.params.path);
	const parent = await event.parent();

	return {
		relevantFile: {
			tree: getRelevantFile(parent.files, event.params.path),
			file: response.json,
		},
		commentsObject,
		form,
	};
};
