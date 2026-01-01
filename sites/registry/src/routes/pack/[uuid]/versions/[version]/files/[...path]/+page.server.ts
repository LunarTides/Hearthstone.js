import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { File, FileTree } from "$lib/api/types";
import { error } from "@sveltejs/kit";

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

export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const response = await requestAPI<File>(
		event,
		resolve("/api/v1/pack/[uuid]/versions/[version]/files/[...path]", {
			uuid: event.params.uuid,
			version: event.params.version,
			path: event.params.path,
		}),
	);
	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	const parent = await event.parent();

	return {
		relevantFile: {
			tree: getRelevantFile(parent.files, event.params.path),
			file: response.json,
		},
	};
};
