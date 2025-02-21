import { type BlueprintWithOptional, Type } from "@Game/types.js";
import { resumeTagParsing, stopTagParsing } from "chalk-tags";

// If this is set to true, this will force debug mode.
const mainDebugSwitch = false;

export enum CCType {
	Unknown = "Unknown",
	Class = "Class",
	Custom = "Custom",
	Vanilla = "Vanilla",
}

/**
 * Returns the ability of a card based on its type.
 *
 * @param cardType The type of the card.
 * @returns The ability of the card.
 */
function getCardAbility(blueprint: BlueprintWithOptional): string {
	// Get the card's ability
	let ability: string;

	// If the card is a spell, the ability is 'cast'
	switch (blueprint.type) {
		case Type.Spell: {
			ability = "Cast";
			break;
		}

		case Type.Hero: {
			ability = "Battlecry";
			break;
		}

		case Type.Location: {
			ability = "Use";
			break;
		}

		case Type.HeroPower: {
			ability = "Heropower";
			break;
		}

		case Type.Minion:
		case Type.Weapon: {
			// Try to extract an ability from the card's description
			const reg = /([A-Z][a-z].*?):/g;
			const foundAbility = reg.exec(blueprint.text);

			if (!blueprint.text) {
				// If the card doesn't have a description, it doesn't get an ability.
				ability = "";
			} else if (foundAbility) {
				// If it didn't find an ability, but the card has text in it's description, the ability is 'passive'
				ability = foundAbility[1];
			} else {
				// If it found an ability, and the card has a description, the ability is the ability it found in the description.
				ability = "Passive";
			}

			break;
		}

		case Type.Undefined: {
			throw new Error("undefined type");
		}

		// No default
	}

	return ability;
}

/**
 * Generates a path for a card based on its classes and type.
 *
 * @param args [The classes of the card, The type of the card]
 * @returns The generated card path
 */
function generateCardPath(blueprint: BlueprintWithOptional): string {
	// Create a path to put the card in.

	// DO NOT CHANGE THIS
	const staticPath = `${game.functions.util.dirname()}/cards/`;

	// You can change everything below this comment
	const classesString = blueprint.classes.join("/");

	let { type } = blueprint;

	// If the card has the word "Secret" in its description, put it in the ".../Secrets/..." folder.
	if (blueprint.text.includes("Secret:")) {
		type = "Secret" as Type;
	}

	// If the type is Hero, we want the card to go to '.../Heroes/...' and not to '.../Heros/...'
	const typeString = type === Type.Hero ? "Heroe" : type;

	const collectibleString = blueprint.collectible
		? "Collectible"
		: "Uncollectible";

	/*
	 * This can be anything since the card register process ignores folders.
	 * Change this if you want the cards to be in different folders.
	 * By default, this is `cards/Classes/{class name}/{Collectible | Uncollectible}/{type}s/{mana cost} Cost/{card name}.ts`;
	 * This path can be overridden by passing `overridePath` in the create function.
	 */
	const dynamicPath = `Classes/${classesString}/${collectibleString}/${typeString}s/${blueprint.cost}-Cost/`;

	return staticPath + dynamicPath;
}

/**
 * Returns the latest ID from the file '/cards/.latestId'.
 *
 * @returns The latest ID.
 */
export function getLatestId(): number {
	return game.lodash.parseInt(
		game.functions.util.fs("readFile", "/cards/.latestId", {
			invalidateCache: true,
		}) as string,
	);
}

/**
 * Generates a new card based on the provided arguments and saves it to a file.
 *
 * @param creatorType The type of card creator.
 * @param cardType The type of card.
 * @param blueprint The blueprint for the card.
 * @param overridePath The override path for the card.
 * @param overrideFilename The override filename for the card.
 * @param debug If true, doesn't save the card, just prints out details about it.
 *
 * @returns The path of the created file.
 */
export async function create(
	creatorType: CCType,
	blueprint: BlueprintWithOptional,
	overridePath?: string,
	overrideFilename?: string,
	debug?: boolean,
): Promise<string> {
	/*
	 * TODO: Search for keywords in the card text and don't add a passive ability if one was found. And vice versa. #277
	 * TODO: Look for placeholders in the text and add a placeholder ability if it finds one. #277
	 */

	// Validate
	if (blueprint.type !== Type.HeroPower) {
		const error = game.functions.card.validateBlueprint(blueprint);
		if (error !== true) {
			console.error(error);
			return "";
		}
	}

	const debugMode = debug || mainDebugSwitch;

	let ability = getCardAbility(blueprint);

	// Here it creates a default function signature
	const isPassive = ability.toLowerCase() === "passive";
	let triggerText = ")";
	if (isPassive) {
		triggerText = ", key, value, eventPlayer)";
	}

	let extraPassiveCode = "";
	if (isPassive) {
		extraPassiveCode = `

        // Only proceed if the correct event key was broadcast
        if (!game.event.is(key, value, Event.ChangeMe)) {
            return;
        }`;
	}

	// If the text has `<b>Battlecry:</b> Dredge.`, add `// Dredge.` to the battlecry ability
	const cleanedDescription = game.functions.color
		.stripTags(blueprint.text)
		.replace(`${ability}: `, "");

	// `create` ability
	const runes = blueprint.runes
		? `        self.runes = "${blueprint.runes}"\n`
		: "";
	let keywords = "";

	if (blueprint.keywords) {
		for (const keyword of blueprint.keywords) {
			// 8 spaces
			keywords += `        self.addKeyword(Keyword.${keyword});\n`;
		}

		// Remove the last newline.
		keywords = keywords.slice(0, -1);
	}

	// Do this here because of the `blueprint.keywords = undefined` line below.
	const keywordImport =
		(blueprint.keywords?.length ?? 0) > 0 ? "\n\tKeyword," : "";
	const createAbility = blueprint.text
		? `
    async create(owner, self) {
        // Add additional fields here
${runes}${keywords}
    },`
		: "";

	blueprint.runes = undefined;
	blueprint.keywords = undefined;

	/*
	 * Normal ability
	 * Example 1: '\n\n    passive(owner, self, key, value, eventPlayer) {\n        // Your battlecries trigger twice.\n        ...\n    }',
	 * Example 2: '\n\n    battlecry(owner, self) {\n        // Deal 2 damage to the opponent.\n        \n    }'
	 */
	if (ability) {
		const extraNewline = extraPassiveCode ? "" : "\n";

		ability = `

    async ${ability.toLowerCase()}(owner, self${triggerText} {
        // ${cleanedDescription}${extraPassiveCode}${extraNewline}
    },

    async test(owner, self) {
        // Unit testing
        assert(false);
    },`;
	}

	// Get the latest card-id
	const id = getLatestId() + 1;

	// Create a path to put the card in.
	let path = generateCardPath(blueprint).replaceAll("\\", "/");

	// If this function was passed in a path, use that instead.
	if (overridePath) {
		path = game.functions.util.dirname() + overridePath;
	}

	// Create a filename. Example: "Test Card" -> "test_card.ts"
	let filename = `${id}-${blueprint.name
		.toLowerCase()
		.replaceAll(" ", "-")
		.replaceAll(/[^a-z\d-]/g, "")}.ts`;

	// If this function was passed in a filename, use that instead.
	if (overrideFilename) {
		filename = `${id}-${overrideFilename}`;
	}

	let usesTags = false;

	/*
	 * Generate the content of the card
	 * If the value is a string, put '"value"'. If it is not a string, put 'value'.
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const getTypeValue = (key: string, value: any) => {
		if (key === "id") {
			// Id gets handled elsewhere.
			return;
		}

		let returnValue = value;

		/**
		 * Adds double quotes around the string
		 */
		const stringify = (text: string) => `"${text.replaceAll('"', '\\"')}"`;

		// If the value is an array, put "["value1", "value2"]", or "[1, 2]", or any combination of those two.
		if (Array.isArray(value)) {
			returnValue = `[${value
				.map((v: unknown) => {
					if (typeof v === "string") {
						switch (key) {
							case "classes":
								return `Class.${v.replaceAll(" ", "")}`;
							case "tags":
								usesTags = true;
								return `CardTag.${v.replaceAll(" ", "")}`;

							case "tribes":
								return `MinionTribe.${v.replaceAll(" ", "")}`;
							case "spellSchools":
								return `SpellSchool.${v.replaceAll(" ", "")}`;

							default:
								return stringify(v);
						}
					}

					return v;
				})
				.join(", ")}]`;
		}

		// If the value is a string, put "value"
		if (typeof value === "string") {
			switch (key) {
				case "type":
					returnValue = `Type.${value}`;
					break;
				case "rarity":
					returnValue = `Rarity.${value}`;
					break;

				case "tribe":
					returnValue = `MinionTribe.${value}`;
					break;
				case "spellSchool":
					returnValue = `SpellSchool.${value}`;
					break;

				default:
					returnValue = stringify(value);
					break;
			}
		}

		// Turn the value into a string.
		if (returnValue || returnValue === 0 || returnValue === false) {
			return returnValue.toString();
		}

		return undefined;
	};

	// Add the key/value pairs to the content
	const contentArray = Object.entries(blueprint).map((c) => {
		const key = c[0].replaceAll('"', '\\"');
		const value = getTypeValue(...c);
		if (value === undefined) {
			return "";
		}

		let returnValue = `${key}: ${value},\n\t`;
		if (key === "tags") {
			returnValue += `id: ${id},\n\n\t`;
		}

		return returnValue;
	});

	// If the function is passive, add `Event` to the list of imports
	const passiveImport = isPassive ? "\n\tEvent," : "";
	const tagImport = usesTags ? "\n\tCardTag," : "";
	let typeImport = "\n\t";

	switch (blueprint.type) {
		case Type.Minion:
			typeImport += "MinionTribe,";
			break;
		case Type.Spell:
			typeImport += "SpellSchool,";
			break;
		case Type.Weapon:
		case Type.Location:
		case Type.Hero:
		case Type.HeroPower:
		case Type.Undefined:
			typeImport = "";
			break;
	}

	// Add the content
	const content = `// Created by the ${creatorType} Card Creator

import assert from "node:assert";
import {
	type Blueprint,${tagImport}
	Class,${passiveImport}${typeImport}${keywordImport}
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
    ${contentArray.join("")}${createAbility}${ability}
};
`;

	// The path is now "./cardcreator/../cards/...", replace this with "./cards/..."
	const filePath = path + filename;

	if (debugMode) {
		/*
		 * If debug mode is enabled, just show some information about the card.
		 * This is the id that would be written to '.latestId'
		 */
		console.log();

		if (mainDebugSwitch) {
			console.warn("<yellow>Main Debug Switch is enabled.</yellow>");
		}

		stopTagParsing();

		console.log("New ID: %s", id);
		console.log("Would be path: %s", filePath.replaceAll("\\", "/"));
		console.log("Content:");
		console.log(content);

		resumeTagParsing();
		await game.pause();
	} else {
		// If debug mode is disabled, write the card to disk.

		// Increment the id in '.latestId' by 1
		game.functions.util.fs("write", "/cards/.latestId", id.toString());

		// If the path the card would be written to doesn't exist, create it.
		if (!game.functions.util.fs("exists", path)) {
			game.functions.util.fs("mkdir", path, { recursive: true });
		}

		// Write the file to the path
		game.functions.util.fs("write", filePath, content);

		console.log(`File created at: "${filePath}"`);

		// TODO: Fix this. #277 #382
		// console.log("Trying to compile...");
		// if (game.functions.util.tryCompile()) {
		// 	console.log("<bright:green>Success!</bright:green>");
		// } else {
		// 	console.error(
		// 		"<yellow>WARNING: Compiler error occurred. Please fix the errors in the card.</yellow>",
		// 	);
		// }
	}

	game.functions.card.generateIdsFile();

	// Open the defined editor on that card if it has a function to edit, and debug mode is disabled
	if (ability && !debugMode) {
		game.functions.util.runCommand(
			`${game.config.general.editor} "${filePath}"`,
		);
	}

	return filePath;
}
