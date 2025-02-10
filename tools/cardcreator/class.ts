import { createGame } from "@Core/game.js";
import type { Blueprint, CardClass, CardRarity } from "@Game/types.js";
import * as lib from "./lib.js";

const { game } = createGame();

/**
 * Asks the user a series of questions, and creates a class card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 */
export async function main(
	debug = false,
	overrideType?: lib.CcType,
): Promise<void> {
	const watermark = () => {
		game.functions.interact.cls();
		console.log("Hearthstone.js Class Creator (C) 2022\n");
		console.log("type 'back' at any step to cancel.\n");
	};

	const questions = [
		"What should the name of the class be?",
		"What should the default hero's name be?",
		"What should the name of the heropower be?",
		"What should the description of the hero power be? (example: Deal 2 damage to the enemy hero.):",
		"How much should the hero power cost? (Default is 2):",
	];

	const answers: string[] = [];
	let exited = false;

	// Ask the questions as defined above and push the answer to answers
	for (const question of questions) {
		if (exited) {
			continue;
		}

		watermark();
		const value = await game.input(`${question} `);
		if (!value || game.functions.interact.isInputExit(value)) {
			exited = true;
		}

		answers.push(value);
	}

	if (exited) {
		return;
	}

	const [className, heroName, hpName, hpText, hpCost] = answers;

	const heroBlueprint: Blueprint = {
		name: heroName,
		text: `${game.lodash.capitalize(className)} starting hero`,
		cost: 0,
		type: "Hero",
		// We do +2 since the hero card will be created first (+1), then the heropower (+1)
		classes: [className] as CardClass[],
		rarity: "Free" as CardRarity,
		collectible: false,
		// This will be overwritten by the library
		id: 0,

		armor: 0,
		heropowerId: lib.getLatestId() + 2,
	};

	const heropowerBlueprint: Blueprint = {
		name: hpName,
		text: hpText,
		cost: game.lodash.parseInt(hpCost),
		type: "Heropower",
		classes: [className] as CardClass[],
		rarity: "Free" as CardRarity,
		collectible: false,
		// This will be overwritten by the library
		id: 0,
	};

	let cctype: lib.CcType = "Class";
	if (overrideType) {
		cctype = overrideType;
	}

	await lib.create(
		cctype,
		heroBlueprint,
		`/cards/StartingHeroes/${game.lodash.startCase(className)}/`,
		"hero.ts",
		debug,
	);

	await lib.create(
		cctype,
		heropowerBlueprint,
		`/cards/StartingHeroes/${game.lodash.startCase(className)}/`,
		"heropower.ts",
		debug,
	);

	console.log("\nClass Created!");
	console.log("Next steps:");

	console.log(
		"1. Open 'src/types.ts', navigate to 'CardClass', and add the name of the class to that. There is unfortunately no way to automate that.",
	);

	console.log(
		"2. Open 'cards/StartingHeroes/%s/%s-heropower.ts' and add logic to the 'cast' function.",
		game.lodash.startCase(className),
		lib.getLatestId(),
	);

	console.log(
		"3. Now when using the Custom Card Creator, type '%s' into the 'Class' field to use that class.",
		className,
	);

	console.log(
		"4. When using the Deck Creator, type '%s' to create a deck with cards from your new class.",
		className,
	);

	console.log("Enjoy!");
	await game.pause();
}
