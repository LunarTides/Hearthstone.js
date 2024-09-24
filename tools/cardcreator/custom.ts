/**
 * This is the custom card creator.
 * @module Custom Card Creator
 */

import { createGame } from "@Game/internal.js";
import type {
	Blueprint,
	BlueprintWithOptional,
	CardClass,
	CardKeyword,
	CardRarity,
	CardType,
	MinionTribe,
	SpellSchool,
} from "@Game/types.js";
import * as lib from "./lib.js";

const { player1, game } = createGame();

let shouldExit = false;
let type: CardType;

/**
 * Asks the user a question and returns the result.
 * This is a wrapper for `game.input` that might set the global `shouldExit` variable.
 */
async function input(prompt: string): Promise<string> {
	if (shouldExit) {
		return "";
	}

	const returnValue = await game.input(prompt);

	if (game.interact.shouldExit(returnValue)) {
		shouldExit = true;
	}

	return returnValue;
}

/**
 * Parses user input, `_card`, into a working card that can be passed to the library.
 */
function applyCard(_card: BlueprintWithOptional): Blueprint {
	const newCard = {} as Blueprint;

	for (const entry of Object.entries(_card)) {
		let [key, value] = entry;

		// These are the required fields and their default values.
		const defaults = {
			name: "CHANGE THIS",
			text: "",
			cost: 0,
			classes: ["Neutral"],
			rarity: "Free",
			attack: 1,
			health: 1,
			tribe: "None",
			spellSchool: "None",
			armor: 5,
			heropowerId: 0,
			durability: 2,
			cooldown: 2,
		};

		let valueUndefined = !value;

		// If the value is an array, the value is undefined if every element is falsy
		valueUndefined ||= Array.isArray(value) && value.every((v) => !v);

		// The value should not be undefined if it is 0
		valueUndefined &&= value !== 0;

		// Don't include the key if the value is falsy, unless the key is required.
		const defaultValue = game.lodash.get(defaults, key);
		if (defaultValue !== undefined && valueUndefined) {
			value = defaultValue;
			valueUndefined = false;
		}

		if (valueUndefined) {
			continue;
		}

		// HACK: Well, it is not ts-expect-error at least
		newCard[key as keyof Blueprint] = value as never;
	}

	return newCard;
}

/**
 * Asks the user questions that apply to every card type.
 */
async function common(): Promise<BlueprintWithOptional> {
	const name = await input("Name: ");
	const text = await input("Text: ");
	const cost = game.lodash.parseInt(await input("Cost: "));
	const classes = await input("Classes: ") as CardClass;
	const rarity = await input("Rarity: ") as CardRarity;
	const keywords = await input("Keywords: ");

	player1.heroClass = classes;

	let runes = "";
	if (player1.canUseRunes()) {
		runes = await input("Runes: ");
	}

	let realKeywords: CardKeyword[] | undefined;
	if (keywords) {
		realKeywords = keywords.split(", ") as CardKeyword[];
	}

	return {
		name,
		text,
		cost,
		type,
		classes: [classes],
		rarity,
		runes,
		keywords: realKeywords,
		collectible: true,
		id: 0,
	};
}

const cardTypeFunctions: { [x in CardType]: () => Promise<Blueprint> } = {
	async Minion(): Promise<Blueprint> {
		const card = await common();

		const attack = game.lodash.parseInt(await input("Attack: "));
		const health = game.lodash.parseInt(await input("Health: "));
		const tribe = await input("Tribe: ") as MinionTribe;

		return applyCard({
			...card,
			attack,
			health,
			tribe,
		});
	},

	async Spell(): Promise<Blueprint> {
		const card = await common();

		const spellSchool = await input("Spell School: ") as SpellSchool;

		return applyCard({
			...card,
			spellSchool,
		});
	},

	async Weapon(): Promise<Blueprint> {
		const card = await common();

		const attack = game.lodash.parseInt(await input("Attack: "));
		const health = game.lodash.parseInt(await input("Health: "));

		return applyCard({
			...card,
			attack,
			health,
		});
	},

	async Hero(): Promise<Blueprint> {
		const card = await common();

		const armor = game.lodash.parseInt(await input("Armor (Default: 5):")) ?? 5;

		console.log("Make the Hero Power:");
		if (!await main()) {
			throw new Error("Failed to create hero power");
		}

		return applyCard({
			...card,
			armor,
			heropowerId: lib.getLatestId(),
		});
	},

	async Location(): Promise<Blueprint> {
		const card = await common();

		const durability = game.lodash.parseInt(
			await input(
				"Durability (How many times you can trigger this location before it is destroyed): ",
			),
		);

		const cooldown =
			game.lodash.parseInt(await input("Cooldown (Default: 2): ")) ?? 2;

		return applyCard({
			...card,
			durability,
			cooldown,
		});
	},

	async Heropower(): Promise<Blueprint> {
		const card = await common();

		return applyCard(card);
	},

	async Undefined(): Promise<Blueprint> {
		throw new TypeError("Undefined type");
	},
};

/**
 * Asks the user a series of questions, and creates a custom card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 *
 * @returns The path to the file
 */
export async function main(debug = false, overrideType?: lib.CcType): Promise<string | false> {
	// Reset the shouldExit switch so that the program doesn't immediately exit when the user enters the ccc, exits, then enters ccc again
	shouldExit = false;

	console.log("Hearthstone.js Custom Card Creator (C) 2022\n");
	console.log("type 'back' at any step to cancel.\n");

	// Ask the user for the type of card they want to make
	type = game.lodash.startCase(await input("Type: ")) as CardType;
	if (shouldExit) {
		return false;
	}

	if (!Object.keys(cardTypeFunctions).includes(type)) {
		console.log("That is not a valid type!");
		await game.pause();
		return false;
	}

	const cardFunction = cardTypeFunctions[type];
	const card = await cardFunction();

	if (shouldExit) {
		return false;
	}

	// Ask the user if the card should be uncollectible
	const uncollectible = await game.interact.yesNoQuestion("Uncollectible?");
	if (uncollectible) {
		card.collectible = !uncollectible;
	}

	// Actually create the card
	console.log("Creating file...");

	let cctype: lib.CcType = "Custom";
	if (overrideType) {
		cctype = overrideType;
	}

	const filePath = await lib.create(cctype, card, undefined, undefined, debug);

	await game.pause();
	return filePath;
}
