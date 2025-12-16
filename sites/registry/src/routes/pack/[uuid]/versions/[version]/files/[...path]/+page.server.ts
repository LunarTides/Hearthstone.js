import { resolve } from "$app/paths";
import type { File, FileTree } from "$lib/api/types";
import { error } from "@sveltejs/kit";

const getRelevantFile = (files: FileTree[], path: string | undefined): FileTree | undefined => {
	if (!path) {
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
	const response = await event.fetch(
		resolve("/api/v1/pack/[uuid]/versions/[version]/files/[...path]", {
			uuid: event.params.uuid,
			version: event.params.version,
			path: event.params.path,
		}),
	);

	const json = await response.json();
	if (response.status !== 200) {
		return error(response.status, { message: json.message });
	}

	const parent = await event.parent();

	return {
		relevantFile: {
			tree: getRelevantFile(parent.files, event.params.path),
			file: json as File,
		},
	};
};
