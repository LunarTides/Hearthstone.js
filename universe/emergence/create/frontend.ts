import { SentimentAI } from "@Game/ai.ts";
import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import {
	type Blueprint,
	type BlueprintWithOptional,
	Class,
	type Command,
	EnchantmentPriority,
	Rarity,
	type SFX,
	Type,
} from "@Game/types.ts";
import boxen from "boxen";
import { parseTags } from "chalk-tags";
import * as hub from "hub.ts";
import { EMERGENCE_VERSION } from "../lib.ts";
import {
	resourceTypeHooks as libResourceTypeHooks,
	type Resource,
	type ResourceObject,
} from "./lib.ts";

if (import.meta.main) {
	await createGame();
}

const cardTypeSpecific: {
	[x in Type]: (keyof Blueprint)[];
} = {
	[Type.Minion]: ["attack", "health", "tribes"],
	[Type.Spell]: ["spellSchools"],
	[Type.Weapon]: ["attack", "health"],
	[Type.Location]: ["durability", "cooldown"],
	[Type.Hero]: ["armor"],
	[Type.HeroPower]: [],
	[Type.Enchantment]: ["enchantmentPriority"],
	[Type.Undefined]: [],
};

const resourceTypeHooks = {
	card: {
		init: async () => {
			return {
				type: Type.Minion,
				name: "Card",
				text: "",
				cost: 1,
				classes: [Class.Neutral],
				rarity: Rarity.Free,
				collectible: false,
				tags: [],
				// Will be filled in by the lib.
				id: "",

				// Type-specific.
				// Minion / Weapon
				attack: 1,
				health: 1,
				tribes: [],

				// Spell
				spellSchools: [],

				// Location
				durability: 2,
				cooldown: 2,

				// Hero
				armor: 0,

				// Enchantment
				enchantmentPriority: EnchantmentPriority.Normal,

				keywords: [],
				runes: [],
			} as BlueprintWithOptional;
		},
		entries: async (resource: BlueprintWithOptional) => {
			const wantedEntries = Object.entries(cardTypeSpecific)
				.filter(([key, value]) => key === resource.type)
				.flatMap(([key, value]) => value);
			const unwantedEntries = Object.values(cardTypeSpecific)
				.flat()
				.filter((value) => !wantedEntries.includes(value));

			return {
				exclude: ["id", ...unwantedEntries],
				split: [
					{ key: "tags", relativePosition: +1 },
					{ key: "keywords", relativePosition: -1 },
				],
				enums: {
					exclude: ["Undefined"],
				},
			};
		},
		onloop: async (resource: BlueprintWithOptional) => {
			// Make the preview
			const card = await Card.create(
				game.ids.Official.builtin.sheep[0],
				game.player,
			);

			// The game wasn't made for this. Oh well!
			card.blueprint = resource;
			await card.doBlueprint(false, true);

			card.id = game.ids.null;
			card.uuid = game.ids.null;

			// Add AI section
			{
				const ai = new SentimentAI(game.player1);

				const sheep = await Card.create(
					game.ids.Official.builtin.sheep[0],
					game.player1,
				);
				const coin = await Card.create(
					game.ids.Official.builtin.the_coin[0],
					game.player1,
				);
				const armorUp = await Card.create(
					game.ids.Official.builtin.armor_up[0],
					game.player1,
				);

				const sentiment = ai.analyzePositiveCard(card);
				const references = await Promise.all(
					[sheep, coin, armorUp].map(
						async (card) =>
							`Reference: ${await card.readable()} = ${ai.analyzePositiveCard(card)}`,
					),
				);

				const simulation = "N/A (Too situational)";

				console.log(
					boxen(
						parseTags(
							`Sentiment: ${sentiment}\n${references.join("\n")}\n\nSimulation: ${simulation}`,
						),
						{
							title: "AI",
							padding: 0.5,
						},
					),
				);
				console.log();
			}

			// Print preview section
			console.log(await card.readable());
			console.log();
		},
		done: async (resource: BlueprintWithOptional) => {
			// Delete unwanted type-specific entries.
			const wantedEntries = Object.entries(cardTypeSpecific)
				.filter(([key, value]) => key === resource.type)
				.flatMap(([key, value]) => value);
			const unwantedEntries = Object.values(cardTypeSpecific)
				.flat()
				.filter((value) => !wantedEntries.includes(value));

			for (const entry of unwantedEntries) {
				delete resource[entry];
			}

			return resource;
		},
	},
	command: {
		init: async () => {
			return {
				name: "command",
				description: "",
				debug: false,
			} as Command;
		},
		entries: async (resource: Command) => {
			return {
				exclude: [],
				split: [],
				enums: {
					exclude: [],
				},
			};
		},
		onloop: async (resource: Command) => {},
		done: async (resource: Command) => resource,
	},
	sfx: {
		init: async () => {
			return {
				name: "sfx",
			} as SFX;
		},
		entries: async (resource: SFX) => {
			return {
				exclude: [],
				split: [],
				enums: {
					exclude: [],
				},
			};
		},
		onloop: async (resource: SFX) => {},
		done: async (resource: SFX) => resource,
	},
};

export async function configure<T extends Resource>(resourceType: T) {
	const hooks = resourceTypeHooks[resourceType];
	const resource = (await hooks.init()) as ResourceObject<T>;

	const libHooks = libResourceTypeHooks[resourceType];
	const enumMappings = await libHooks.enumMappings();

	const configured = await game.prompt.configureObjectV2(resource, {
		message: `Configure Resource (${resourceType})`,
		callbackBefore: async (resource) => {
			hub.watermark(false);
			console.log(`<b>[universe/emergence] v${EMERGENCE_VERSION}</b>\n`);

			await hooks.onloop(resource as any);
		},
		enumMappings,
		entryOptions: hooks.entries,
	});

	if (!configured) {
		return undefined;
	}

	return await hooks.done(configured as any);
}
