import {
	type Blueprint,
	type BlueprintWithOptional,
	Class,
	EnchantmentPriority,
	type Keyword,
	Rarity,
	Rune,
	SpellSchool,
	Tribe,
	Type,
} from "@Game/types.ts";
import * as lib from "./lib.ts";

const player1 = game.player1;

let shouldExit = false;
let type: Type;

/**
 * Asks the user a question and returns the result.
 * This is a wrapper for `game.input` that might set the global `shouldExit` variable.
 */
async function input(prompt: string): Promise<string> {
	if (shouldExit) {
		return "";
	}

	const returnValue = await game.input(prompt);

	if (game.functions.interact.isInputExit(returnValue)) {
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
		const defaults: Blueprint = {
			type: Type.Undefined,
			name: "CHANGE THIS",
			text: "",
			cost: 0,
			classes: [Class.Neutral],
			rarity: Rarity.Free,
			collectible: false,
			tags: [],
			id: 0,

			attack: 1,
			health: 1,
			tribes: [Tribe.None],
			spellSchools: [SpellSchool.None],
			armor: 5,
			heropowerId: game.cardIds.null_0,
			durability: 2,
			cooldown: 2,
			enchantmentPriority: EnchantmentPriority.Normal,
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
	const classes = await input("Classes: ");
	const rarity = game.lodash.startCase(await input("Rarity: ")) as Rarity;
	const keywords = await input("Keywords: ");

	let realClasses: Class[] = [];
	if (classes) {
		realClasses = classes
			.split(", ")
			.map((k) => game.lodash.startCase(k) as Class);
	}

	let realKeywords: Keyword[] | undefined;
	if (keywords) {
		realKeywords = keywords
			.split(", ")
			.map((k) => game.lodash.startCase(k) as Keyword);
	}

	let runes: Rune[] = [];
	for (const c of realClasses) {
		player1.heroClass = c;

		if (player1.canUseRunes()) {
			const runesString = await input(
				`Runes (${Object.values(Rune)
					.map((rune) => rune[0])
					.join("")}): `,
			);
			const runesArray = runesString
				.toUpperCase()
				.split("")
				.map((char) =>
					Object.values(Rune).find((rune) => rune.startsWith(char)),
				);
			if (runesArray.some((rune) => rune === undefined)) {
				throw new Error("Invalid rune found.");
			}

			runes = runesArray as Rune[];
			break;
		}
	}

	return {
		name,
		text,
		cost,
		type,
		classes: realClasses,
		rarity,
		runes,
		keywords: realKeywords,
		collectible: true,
		tags: [],
		id: 0,
	};
}

const cardTypeFunctions: {
	[x in Type]: () => Promise<Blueprint>;
} = {
	async Minion(): Promise<Blueprint> {
		const card = await common();

		const attack = game.lodash.parseInt(await input("Attack: "));
		const health = game.lodash.parseInt(await input("Health: "));
		const tribes = await input("Tribes: ");

		let realTribes: Tribe[] = [];
		if (tribes) {
			realTribes = tribes
				.split(", ")
				.map((k) => game.lodash.startCase(k) as Tribe);
		}

		return applyCard({
			...card,
			attack,
			health,
			tribes: realTribes,
		});
	},

	async Spell(): Promise<Blueprint> {
		const card = await common();

		const spellSchools = await input("Spell School: ");

		let realSpellSchools: SpellSchool[] = [];
		if (spellSchools) {
			realSpellSchools = spellSchools
				.split(", ")
				.map((k) => game.lodash.startCase(k) as SpellSchool);
		}

		return applyCard({
			...card,
			spellSchools: realSpellSchools,
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

		const armor =
			game.lodash.parseInt(await input("Armor (Default: 5): ")) ?? 5;
		const heropowerId = game.lodash.parseInt(
			(await input("Hero Power ID (Leave blank to create a new one): ")) || "0",
		);

		if (heropowerId === 0) {
			console.log("\n<green bold>Make the Hero Power:<green bold>\n");
			if (!(await main({ overrideCardType: Type.HeroPower }))) {
				throw new Error("Failed to create hero power");
			}
		}

		return applyCard({
			...card,
			armor,
			heropowerId: heropowerId || (await lib.getLatestId()),
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

	async HeroPower(): Promise<Blueprint> {
		const card = await common();

		return applyCard(card);
	},

	async Enchantment(): Promise<Blueprint> {
		const card = await common();

		const enchantmentPriority = Number.parseInt(
			await input(
				"Enchantment Priority (-2: lowest | -1: low | 0: normal | 1: high | 2: highest): ",
			),
			10,
		) as EnchantmentPriority;

		return applyCard({
			...card,
			enchantmentPriority,
		});
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
export async function main({
	debug = false,
	overrideCCType,
	overrideCardType,
}: {
	debug?: boolean;
	overrideCCType?: lib.CCType;
	overrideCardType?: Type;
}): Promise<string | false> {
	// Reset the shouldExit switch so that the program doesn't immediately exit when the user enters the ccc, exits, then enters ccc again
	shouldExit = false;

	console.log("Hearthstone.js Custom Card Creator (C) 2022\n");
	console.log("type 'back' at any step to cancel.\n");

	if (overrideCardType) {
		type = overrideCardType;
		console.log("Type: %s", type);
	} else {
		// Ask the user for the type of card they want to make
		type = game.lodash.startCase(await input("Type: ")) as Type;
		if (shouldExit) {
			return false;
		}
	}

	if (type === ("Heropower" as Type) || type === ("Hero Power" as Type)) {
		type = Type.HeroPower;
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
	const uncollectible = await game.prompt.yesNo("Uncollectible?");
	if (uncollectible) {
		card.collectible = !uncollectible;
	}

	// Actually create the card
	console.log("Creating file...");

	let cctype: lib.CCType = lib.CCType.Custom;
	if (overrideCCType) {
		cctype = overrideCCType;
	}

	const filePath = await lib.create(cctype, card, undefined, undefined, debug);

	await game.pause();
	return filePath;
}
