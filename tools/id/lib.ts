/**
 * A collection of functions relating to reading and writing ids of blueprints.
 */

import { createGame } from "@Game/game.ts";

await createGame();

const idRegex = /id: "([0-9a-f-]+)"/;

/**
 * Check for duplicates in the ids.
 *
 * @param logFailure If it should log when it encounters a duplicate. This should probably be `true` when using this as a library.
 * @param logSuccess If it should log when it doesn't encounter a duplicate. This should probably be `false` when using this as a library.
 *
 * @returns Amount of duplicates
 */
export async function validate(
	logFailure: boolean,
	logSuccess: boolean,
): Promise<number> {
	const ids: [[string, string]] = [["", ""]];

	await game.functions.util.searchCardsFolder(async (path, content) => {
		const idMatch = idRegex.exec(content);
		if (!idMatch) {
			console.error(`No id found in ${path}`);
			return;
		}

		const id = idMatch[1];
		ids.push([id, path]);
	});

	ids.sort((a, b) => a[0].toString().localeCompare(b[0].toString()));

	// Check if there are any duplicates.
	let currentId = "";
	let duplicates = 0;

	for (const [id, path] of ids) {
		if (id === "") {
			continue;
		}

		if (id === currentId) {
			if (logFailure) {
				console.error(
					`<bright:yellow>Duplicate id in ${path}. Previous id: ${currentId}. Got id: ${id}. <green>Suggestion: Change one of these ids.</green bright:yellow>`,
				);
			}

			duplicates++;
		}

		currentId = id;
	}

	if (logFailure) {
		if (duplicates > 0) {
			console.log("<yellow>Found %s duplicate(s).</yellow>", duplicates);
		}
	}

	if (logSuccess) {
		if (duplicates <= 0) {
			console.log("<bright:green>No duplicates found.</bright:green>");
		}
	}

	return duplicates;
}
