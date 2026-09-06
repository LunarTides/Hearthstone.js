// Microscope intimately checks for issues with resources by importing them directly. Way more dangerous than telescope.

import { Tag, type Blueprint } from "@Game/types.ts";

export const MICROSCOPE_VERSION = "0.1.0";

// TODO: Move `validateBlueprint` functionality over.
const blueprintFunctions = [
	// Quest.
	async (blueprint: Blueprint) => {
		if (
			blueprint.text.toLowerCase().includes("quest: ") &&
			blueprint.text.toLowerCase().includes("reward: ")
		) {
			// Likely a quest card.
			if (
				!blueprint.tags.includes(Tag.Quest) &&
				!blueprint.tags.includes(Tag.NotQuest)
			) {
				return "Quest-like card doesn't have the Quest tag. Either add the Quest tag, so the card is drawn at the start of the game, or add the NotQuest tag if this is a false positive.";
			}
		}

		return true;
	},
];

export async function checkForIssues(
	includePackResources = false,
): Promise<number> {
	let issues = 0;

	for (const blueprint of game.blueprints) {
		// TODO: Check if the blueprint is associated with a pack.
		// if (!includePackResources) {
		// }

		for (const fun of blueprintFunctions) {
			const errorMessage = await fun(blueprint);
			if (errorMessage === true) {
				continue;
			}

			console.error(
				`<red>${blueprint.name} (${blueprint.id}): ${errorMessage}</red>`,
			);
			issues++;
		}
	}

	if (issues === 0) {
		console.log("<green>No issues found.</green>");
	}

	return issues;
}

if (import.meta.main) {
	await checkForIssues();
}
