import {
	Ability,
	type BlueprintWithOptional,
	EnchantmentPriority,
	Type,
} from "@Game/types.ts";
import { randomUUID } from "node:crypto";
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
 * Returns the abilities of a card based on its type.
 *
 * @param blueprint The blueprint of the card
 * @returns The abilities of the card.
 */
function getCardAbilities(blueprint: BlueprintWithOptional): Ability[] {
	switch (blueprint.type) {
		case Type.Spell: {
			return [Ability.Cast];
		}

		case Type.Location: {
			return [Ability.Use];
		}

		case Type.HeroPower: {
			return [Ability.HeroPower];
		}

		case Type.Enchantment: {
			return [
				Ability.EnchantmentSetup,
				Ability.EnchantmentApply,
				Ability.EnchantmentRemove,
			];
		}

		case Type.Minion:
		case Type.Weapon:
		case Type.Hero: {
			if (!blueprint.text) {
				// If the card doesn't have a description, it doesn't get an ability.
				return [];
			}

			// Try to extract the abilities from the card's description
			const reg = /(?:^|\. )(?:<.*?>)?([A-Z][a-z].*?):/g;
			const foundAbilities = blueprint.text.match(reg);

			if (foundAbilities) {
				// If it found an ability in the description, use it.
				//
				// Remove artifacts.
				const extracted = foundAbilities.map((s) =>
					s
						.replace(/:$/, "")
						.replace(/^\. /, "")
						.replace(/^<.*?>/, "")
						.toLowerCase(),
				);

				// Only use valid abilities.
				const validAbilities = extracted.filter((ability) =>
					Object.values(Ability).includes(ability as Ability),
				) as Ability[];

				return validAbilities.length > 0 ? validAbilities : [Ability.Passive];
			}

			// If it didn't find an ability, but the card has text in it's description, the ability is 'passive'
			return [Ability.Passive];
		}

		case Type.Undefined: {
			throw new Error("undefined type");
		}
	}
}

/**
 * Generates a path for a card based on its classes and type.
 *
 * @param blueprint The blueprint of the card
 * @returns The generated card path
 */
function generateCardPath(blueprint: BlueprintWithOptional): string {
	// Create a path to put the card in.

	// DO NOT CHANGE THIS
	const staticPath = `${game.functions.util.dirname()}/cards/`;

	// You can change everything below this comment
	const classesString = blueprint.classes.join("/");
	const type = blueprint.type;

	let typeString: string = type;

	// If the card has the word "Secret" in its description, put it in the ".../Secrets/..." folder.
	if (blueprint.text.includes("Secret:")) {
		typeString = "Secret";
	}

	// If the type is Hero, we want the card to go to '.../Heroes/...' and not to '.../Heros/...'
	if (type === Type.Hero) {
		typeString = "Heroe";
	}

	const collectibleString = blueprint.collectible
		? "Collectible"
		: "Uncollectible";

	/*
	 * This can be anything since the card register process ignores folders.
	 * Change this if you want the cards to be in different folders.
	 * By default, this is `cards/Classes/{class name}/{Collectible | Uncollectible}/{type}s/{mana cost} Cost/{card name}.ts`;
	 * This path can be overridden by passing `overridePath` in the create function.
	 */
	const dynamicPath = `Custom/Classes/${classesString}/${collectibleString}/${typeString}s/${blueprint.cost}-Cost/`;

	return staticPath + dynamicPath;
}

async function getCreateAbility(
	blueprint: BlueprintWithOptional,
	cleanedDescription: string,
) {
	const runes = blueprint.runes
		? `\t\tself.runes = [${blueprint.runes.map((rune) => `Rune.${rune}`).join(", ")}];\n`
		: "";
	let keywords = "";

	if (blueprint.keywords) {
		for (const keyword of blueprint.keywords) {
			keywords += `\t\tself.addKeyword(Keyword.${keyword.replaceAll(" ", "")});\n`;
		}

		// Remove the last newline.
		keywords = keywords.slice(0, -1);
	}

	if (
		(blueprint.text || blueprint.keywords || runes) &&
		blueprint.type !== Type.Enchantment
	) {
		return `async create(self, owner) {
		// ${cleanedDescription}
${runes}${keywords}
	},`;
	}

	return null;
}

/**
 * Generates a new card based on the provided arguments and saves it to a file.
 *
 * @param creatorType The type of card creator.
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
	 * TODO: Search for *keywords* in the card text and don't add a passive ability if one was found. And vice versa. #277
	 * TODO: Look for placeholders in the text and add a placeholder ability if it finds one. #277
	 */
	blueprint = game.lodash.clone(blueprint);

	const debugMode = debug || mainDebugSwitch;

	const abilities = getCardAbilities(blueprint);
	const abilitiesTexts = [];

	// Validate
	if (
		// TODO: Why can't we validate Hero Powers?
		blueprint.type !== Type.HeroPower
	) {
		const validationBlueprint = game.lodash.clone(blueprint);
		for (const ability of abilities) {
			validationBlueprint[ability] = async () => {};
		}

		const error = game.functions.card.validateBlueprint(validationBlueprint);
		if (error !== true) {
			console.error(error);
			return "";
		}
	}

	const cleanedDescription = game.functions.color.stripTags(blueprint.text);

	// Add create ability
	{
		const createAbility = await getCreateAbility(blueprint, cleanedDescription);

		if (createAbility) {
			abilitiesTexts.push(createAbility);
		}
	}

	// Add other abilities.
	for (const ability of abilities) {
		if (ability === Ability.Passive) {
			abilitiesTexts.push(`async ${ability}(self, owner, key, value, eventPlayer) {
		// ${cleanedDescription}

		// Only proceed if the correct event key was broadcast.
        if (!game.event.is(key, value, Event.ChangeMe)) {
            return;
        };
	},`);
			continue;
		}

		if (
			[
				Ability.EnchantmentSetup,
				Ability.EnchantmentApply,
				Ability.EnchantmentRemove,
			].includes(ability)
		) {
			abilitiesTexts.push(`async ${ability}(self, owner, host) {
		// ${cleanedDescription}

	},`);

			continue;
		}

		abilitiesTexts.push(`async ${ability}(self, owner) {
		// ${cleanedDescription}

	},`);
	}

	abilitiesTexts.push(`async test(self, owner) {
		// Unit testing.
		return EventListenerMessage.Skip;
	},`);

	// Imports
	const imports = [];
	if ((blueprint.keywords?.length ?? 0) > 0) {
		imports.push("Keyword");
	}
	if ((blueprint.runes?.length ?? 0) > 0) {
		imports.push("Rune");
	}
	if (abilities.includes(Ability.Passive)) {
		imports.push("Event");
	}

	switch (blueprint.type) {
		case Type.Minion:
			imports.push("Tribe");
			break;
		case Type.Spell:
			imports.push("SpellSchool");
			break;
		case Type.Enchantment:
			imports.push("EnchantmentPriority");
			break;
		case Type.Weapon:
		case Type.Location:
		case Type.Hero:
		case Type.HeroPower:
		case Type.Undefined:
			break;
	}

	blueprint.runes = undefined;
	blueprint.keywords = undefined;

	// Create a random id.
	const id = randomUUID();

	// Create a path to put the card in.
	let path = generateCardPath(blueprint).replaceAll("\\", "/");

	// If this function was passed in a path, use that instead.
	if (overridePath) {
		path = game.functions.util.dirname() + overridePath;
	}

	// Create a filename. Example: "Test Card" -> "test-card-abcdef12.ts"
	let filename = `${blueprint.name
		.toLowerCase()
		.replaceAll(" ", "-")
		.replaceAll(/[^a-z\d-]/g, "")}-${id.slice(0, 8)}.ts`;

	// If this function was passed in a filename, use that instead.
	if (overrideFilename) {
		filename = `${id}-${overrideFilename}`;
	}

	let usesTags = false;

	/*
	 * Generate the content of the card
	 * If the value is a string, put '"value"'. If it is not a string, put 'value'.
	 */
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
								return `Tag.${v.replaceAll(" ", "")}`;

							case "tribes":
								return `Tribe.${v.replaceAll(" ", "")}`;
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
		switch (key) {
			case "type":
				returnValue = `Type.${value}`;
				break;
			case "rarity":
				returnValue = `Rarity.${value}`;
				break;

			case "tribe":
				returnValue = `Tribe.${value}`;
				break;
			case "spellSchool":
				returnValue = `SpellSchool.${value}`;
				break;
			case "enchantmentPriority": {
				let priority =
					typeof value === "number" ? value : Number.parseInt(`${value}`, 10);

				if (
					Number.isNaN(priority) ||
					EnchantmentPriority[priority] === undefined
				) {
					priority = EnchantmentPriority.Normal;
				}

				returnValue = `EnchantmentPriority.${EnchantmentPriority[priority]}`;
				break;
			}

			default:
				if (typeof value === "string") {
					returnValue = stringify(value);
				}
				break;
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

		// This key should be the key right before id.
		if (key === "tags") {
			returnValue += `id: "${id}",\n\n\t`;
		}

		return returnValue;
	});

	if (usesTags) {
		imports.push("Tag");
	}

	// Add the content
	const content = `// Created by the ${creatorType} Card Creator

import {
\ttype Blueprint,
\tClass,
\tEventListenerMessage,
\tRarity,
\tType,
\t${imports.join(",\n\t")}
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
\t${contentArray.join("")}
\t${abilitiesTexts.join("\n\n\t")}
};
`;

	// The path is now "./cardcreator/../cards/...", replace this with "./cards/..."
	const filePath = path + filename;

	if (debugMode) {
		/*
		 * If debug mode is enabled, just show some information about the card.
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
		if (!(await game.functions.util.fs("exists", path))) {
			await game.functions.util.fs("mkdir", path, { recursive: true });
		}

		// Write the file to the path
		await game.functions.util.fs("writeFile", filePath, content);

		console.log(`File created at: "${filePath}"`);
	}

	await game.functions.card.generateIdsFile();

	// Open the defined editor on that card if it has a function to edit, and debug mode is disabled
	if (abilities.length > 0 && !debugMode) {
		game.functions.util.runCommand(
			`${game.config.general.editor} "${filePath}"`,
		);
	}

	return filePath;
}
