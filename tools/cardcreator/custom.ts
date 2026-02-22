import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import {
	type BlueprintWithOptional,
	Class,
	EnchantmentPriority,
	Keyword,
	Rarity,
	Rune,
	SpellSchool,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";
import { confirm, Separator } from "@inquirer/prompts";
import { parseTags } from "chalk-tags";
import * as hub from "../../hub.ts";
import * as lib from "./lib.ts";

// FIXME: Some tools don't work when run directly.
if (import.meta.main) {
	await createGame();
}

// TODO: Support creating heropowers for heroes.
async function configure(): Promise<BlueprintWithOptional | undefined> {
	const blueprint: BlueprintWithOptional = {
		type: Type.Minion,
		name: "CHANGE ME",
		text: "",
		cost: 0,
		classes: [Class.Neutral],
		rarity: Rarity.Free,
		collectible: false,
		tags: [],
		id: game.ids.Official.builtin.sheep[0],

		attack: 1,
		health: 1,
		tribes: [Tribe.None],
		spellSchools: [SpellSchool.None],
		armor: 5,
		heropowerId: game.ids.Official.builtin.sheep[0],
		durability: 2,
		cooldown: 2,
		enchantmentPriority: EnchantmentPriority.Normal,

		keywords: [],
		runes: [],
	};

	const set = (key: keyof typeof blueprint, value: any) => {
		(blueprint as any)[key] = value;
		(card as any)[key] = value;
		dirty = true;
	};

	const card = await Card.create(
		game.ids.Official.builtin.sheep[0],
		game.player,
	);

	// NOTE: The game is *not* meant for this. Oh well!
	card.blueprint = blueprint;
	await card.doBlueprint(false, true);

	let dirty = false;
	const globalBlacklist: (keyof BlueprintWithOptional)[] = ["id"];
	let blacklist: (keyof BlueprintWithOptional)[] = [];

	while (true) {
		blacklist = game.lodash.clone(globalBlacklist);

		// Heropower Id should always be blacklisted.
		blacklist.push("heropowerId");

		if (blueprint.type !== Type.Minion && blueprint.type !== Type.Weapon) {
			blacklist.push("attack");
			blacklist.push("health");
		}

		if (blueprint.type !== Type.Minion) {
			blacklist.push("tribes");
		}

		if (blueprint.type !== Type.Spell) {
			blacklist.push("spellSchools");
		}

		if (blueprint.type !== Type.Hero) {
			blacklist.push("armor");
		}

		if (blueprint.type !== Type.Location) {
			blacklist.push("durability");
			blacklist.push("cooldown");
		}

		if (blueprint.type !== Type.Enchantment) {
			blacklist.push("enchantmentPriority");
		}

		const cardToPrint: any = {};

		{
			const entries = Object.entries(blueprint).filter(
				(c) => !blacklist.includes(c[0] as keyof BlueprintWithOptional),
			);

			for (const entry of entries) {
				cardToPrint[entry[0]] = entry[1];
			}
		}

		hub.watermark(false);
		console.log(
			JSON.stringify(cardToPrint, null, 4)
				.replace(/("tags": \[.*\],)/, "$1\n")
				.replace(/("keywords": \[.*\],)/, "\n    $1"),
		);
		console.log();
		console.log(await card.readable());
		console.log();

		const answer = await game.prompt.customSelect(
			"Configure Card",
			Object.keys(blueprint).filter(
				(k) => !blacklist.includes(k as keyof BlueprintWithOptional),
			),
			{
				arrayTransform: async (i, element) => ({
					name: game.lodash.startCase(element),
					value: `element-${element}`,
					addSeperatorBefore:
						element === "keywords" &&
						// Heropowers don't have type-specific fields.
						blueprint.type !== Type.HeroPower,
					addSeperatorAfter: element === "tags",
				}),
				hideBack: true,
			},
			new Separator(),
			"Cancel",
			"Done",
		);

		if (answer === "cancel") {
			if (!dirty) {
				// No changes have been made.
				return undefined;
			}

			const done = await confirm({
				message:
					"Are you sure you want to cancel creating this card? Your changes will be lost.",
				default: false,
			});

			if (done) {
				return undefined;
			}
		} else if (answer === "done") {
			let message = "Are you sure you are done configuring the card?";

			if (!blueprint.name || blueprint.name === "CHANGE ME") {
				message = parseTags(
					"<yellow>You haven't changed the name. The game doesn't support cards with empty names. Continue anyway?</yellow>",
				);
			}

			const done = await confirm({
				message,
				default: false,
			});

			if (done) {
				break;
			}

			continue;
		}

		const key = answer
			.split("-")
			.slice(1)
			.join("-") as keyof BlueprintWithOptional;
		const message = game.lodash.startCase(key);

		const value = blueprint[key];

		// Arrays
		if (Array.isArray(value)) {
			let enumType: any;
			const options: {
				maxSize: number | undefined;
				allowDuplicates: boolean;
			} = {
				maxSize: undefined,
				allowDuplicates: false,
			};

			switch (key) {
				case "classes":
					enumType = Class;
					break;
				case "tags":
					enumType = Tag;
					break;
				case "tribes":
					enumType = Tribe;
					break;
				case "spellSchools":
					enumType = SpellSchool;
					break;
				case "keywords":
					enumType = Keyword;
					break;
				case "runes": {
					enumType = Rune;
					options.maxSize = 3;
					options.allowDuplicates = true;
					break;
				}
			}

			const changed = await game.prompt.configureArrayEnum(
				value,
				enumType,
				options,
				async () => {
					hub.watermark(false);
				},
			);

			// Force reset.
			await card.doBlueprint(false, true);

			dirty ||= changed;
			continue;
		}

		if (key === "type") {
			set(
				"type",
				await game.prompt.customSelectEnum<Type>(
					message,
					Object.values(Type).filter((type) => type !== Type.Undefined),
				),
			);
			continue;
		} else if (key === "rarity") {
			set(
				"rarity",
				await game.prompt.customSelectEnum<Rarity>(
					message,
					Object.values(Rarity),
				),
			);
			continue;
		} else if (key === "enchantmentPriority") {
			set(
				"enchantmentPriority",
				parseInt(
					await game.prompt.customSelect(
						message,
						Object.keys(EnchantmentPriority).filter((p) =>
							Number.isNaN(parseInt(p, 10)),
						),
						{
							arrayTransform: async (i, element) => ({
								name: element,
								value: EnchantmentPriority[element as any],
							}),
							hideBack: false,
						},
					),
					10,
				),
			);
			continue;
		}

		if (typeof value === "boolean") {
			const booleanChoice = await game.prompt.customSelect(
				message,
				["True", "False"],
				{
					arrayTransform: async (i, element) => ({
						name: element,
						value: element.toLowerCase(),
					}),
					hideBack: false,
				},
			);

			if (booleanChoice === "Back") {
				continue;
			}

			set(key, booleanChoice === "true");
			continue;
		}

		const newValue = await game.input({
			message: "What will you change this value to?",
			default: value?.toString(),
			validate: (value) => {
				// If the key is a number, make sure the new value is one too.
				if (typeof blueprint[key] === "number") {
					const parsed = parseInt(value, 10);
					if (Number.isNaN(parsed)) {
						return "Please enter a valid number";
					}
				}

				return true;
			},
		});

		if (typeof value === "string") {
			set(key, newValue);
		} else {
			set(key, JSON.parse(newValue));
		}
	}

	// Delete blacklisted fields so that the game won't complain about card type field mismatch.
	for (const key of blacklist) {
		if (globalBlacklist.includes(key)) {
			continue;
		}

		delete blueprint[key];
	}

	return blueprint;
}

/**
 * Asks the user a series of questions, and creates a custom card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 *
 * @returns The path to the file
 */
export async function main({
	debug = false,
}: {
	debug?: boolean;
}): Promise<string | false> {
	const card = await configure();
	if (!card) {
		return false;
	}

	// Actually create the card
	console.log("Creating file...");
	const filePath = await lib.create(
		lib.CCType.Custom,
		card,
		undefined,
		undefined,
		debug,
	);

	await game.pause();
	return filePath;
}

if (import.meta.main) {
	await main({});
}
