import { createGame } from "@Core/game.js";
import {
	type Blueprint,
	Class,
	type MinionTribe,
	Rarity,
	SpellSchool,
	Type,
	type VanillaCard,
} from "@Game/types.js";
import * as lib from "./lib.js";

const { game } = createGame();

/**
 * Create a card from a vanilla card.
 *
 * @param card The vanilla card
 * @param debug If it should use debug mode
 */
export async function create(
	card: VanillaCard,
	debug: boolean,
	overrideType?: lib.CCType,
): Promise<void> {
	// Harvest info
	let cardClass = game.lodash.capitalize(card.cardClass ?? "Neutral") as Class;
	const collectible = card.collectible ?? false;
	const cost = card.cost ?? 0;
	const { name } = card;
	let rarity = Rarity.Free;
	if (card.rarity) {
		rarity = game.lodash.capitalize(card.rarity) as Rarity;
	}

	let text = card.text ?? "";
	let typeString = game.lodash.capitalize(card.type);
	if (typeString === "Hero_power") {
		typeString = "Heropower" as typeof typeString;
	}

	const type = typeString as Type;

	// Minion info
	const attack = card.attack ?? -1;
	const health = card.health ?? -1;
	let races: MinionTribe[] = [];
	if (card.races) {
		races = card.races.map((r) => game.lodash.capitalize(r) as MinionTribe);
	}

	// Spell info
	let spellSchool = SpellSchool.None;
	if (card.spellSchool) {
		spellSchool = game.lodash.capitalize(card.spellSchool) as SpellSchool;
	}

	// Weapon Info
	const durability = card.durability ?? -1;

	// Modify the text
	text = text.replaceAll("\n", " ");
	text = text.replaceAll("[x]", "");

	const classes = (await game.functions.card.getClasses()) as Class[];
	classes.push(Class.Neutral);

	while (!classes.includes(cardClass)) {
		cardClass = game.lodash.startCase(
			await game.input(
				"<red>Was not able to find the class of this card.\nWhat is the class of this card? </red>",
			),
		) as Class;
	}

	if (type === Type.Hero) {
		// Add the hero power
		console.log("<green>Adding the hero power</green>");

		const heroPower = game.functions.card.vanilla
			.getAll()
			.find((c) => c.dbfId === card.heroPowerDbfId);

		if (!heroPower) {
			throw new Error("No hero power found");
		}

		await create(heroPower, debug, overrideType);
	}

	let blueprint: Blueprint = {
		name,
		text,
		cost,
		type,
		classes: [cardClass],
		rarity,
		collectible,
		tags: [],
		id: 0,
	};

	switch (type) {
		case Type.Minion: {
			blueprint = Object.assign(blueprint, {
				attack,
				health,
				// TODO: Add support for more than 1 tribe. #334
				tribe: races[0] || "None",
			});

			break;
		}

		case Type.Spell: {
			blueprint = Object.assign(blueprint, {
				spellSchool,
			});

			break;
		}

		case Type.Weapon: {
			blueprint = Object.assign(blueprint, {
				attack,
				health: durability,
			});

			break;
		}

		case Type.Hero: {
			blueprint = Object.assign(blueprint, {
				armor: card.armor,
				heropowerId: lib.getLatestId(),
			});

			break;
		}

		case Type.Location: {
			blueprint = Object.assign(blueprint, {
				durability: health,
				cooldown: 2,
			});

			break;
		}

		case Type.HeroPower:
		case Type.Undefined: {
			break;
		}

		// No default
	}

	let cctype: lib.CCType = lib.CCType.Vanilla;
	if (overrideType) {
		cctype = overrideType;
	}

	await lib.create(cctype, blueprint, undefined, undefined, debug);
}

/**
 * Prompt the user to pick a card, then create it.
 *
 * @returns If a card was created
 */
export async function main(
	debug = false,
	overrideType?: lib.CCType,
): Promise<boolean> {
	console.log("Hearthstone.js Vanilla Card Creator (C) 2022\n");

	const vanillaCards = game.functions.card.vanilla.getAll();

	let running = true;
	while (running) {
		const cardName = await game.input("Name / dbfId (Type 'back' to cancel): ");
		if (game.functions.interact.isInputExit(cardName)) {
			running = false;
			break;
		}

		let filteredCards = vanillaCards.filter(
			(c) =>
				c.name.toLowerCase() === cardName.toLowerCase() ||
				c.dbfId === game.lodash.parseInt(cardName),
		);

		filteredCards = game.functions.card.vanilla.filter(
			filteredCards,
			false,
			true,
		);

		if (filteredCards.length <= 0) {
			console.log("Invalid card.\n");
			continue;
		}

		let card: VanillaCard;

		if (filteredCards.length > 1) {
			// Prompt the user to pick one
			for (const [index, vanillaCard] of filteredCards.entries()) {
				// Get rid of useless information
				// biome-ignore lint/performance/noDelete: <explanation>
				delete vanillaCard.elite;
				// biome-ignore lint/performance/noDelete: <explanation>
				delete vanillaCard.heroPowerDbfId;
				// biome-ignore lint/performance/noDelete: <explanation>
				delete vanillaCard.artist;
				// biome-ignore lint/performance/noDelete: <explanation>
				delete vanillaCard.flavor;
				// biome-ignore lint/performance/noDelete: <explanation>
				delete vanillaCard.mechanics;

				const { id, ...card } = vanillaCard;

				console.log("\n%s:", index + 1);
				console.log(card);
			}

			const picked = game.lodash.parseInt(
				await game.logger.inputTranslate(
					"Pick one (1-%s): ",
					filteredCards.length,
				),
			);

			if (!picked || !filteredCards[picked - 1]) {
				console.log("Invalid number.\n");
				continue;
			}

			card = filteredCards[picked - 1];
		} else {
			card = filteredCards[0];
		}

		console.log("Found '%s'\n", card.name);

		await create(card, debug, overrideType);
	}

	return true;
}
