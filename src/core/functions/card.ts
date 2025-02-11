import { Card } from "@Core/card.js";
import type { Player } from "@Core/player.js";
import type {
	Blueprint,
	CardClass,
	CardClassNoNeutral,
	CardType,
	MinionTribe,
	VanillaCard,
} from "@Game/types.js";

const vanilla = {
	/**
	 * Returns all cards added to Vanilla Hearthstone.
	 *
	 * This will throw an error if the user has not run the vanilla card generator,
	 *
	 * @example
	 * const vanillaCards = getAll();
	 *
	 * for (const vanillaCard of vanillaCard) {
	 *     console.log(vanillaCard.dbfId);
	 * }
	 *
	 * @returns The vanilla cards
	 */
	getAll(): VanillaCard[] {
		const fileLocation = "/vanillacards.json";
		if (game.functions.util.fs("exists", fileLocation)) {
			return JSON.parse(
				game.functions.util.fs("read", fileLocation) as string,
			) as VanillaCard[];
		}

		throw new Error(
			"Cards file not found! Run 'bun run script:vanilla:generate' (requires an internet connection), then try again.",
		);
	},

	/**
	 * Filter out some useless vanilla cards
	 *
	 * @param cards The list of vanilla cards to filter
	 * @param uncollectible If it should filter away uncollectible cards
	 * @param dangerous If there are cards with a 'howToEarn' field, filter away any cards that don't have that.
	 *
	 * @returns The filtered cards
	 *
	 * @example
	 * // The numbers here are not accurate, but you get the point.
	 * assert(cards.length, 21022);
	 *
	 * cards = filter(cards, true, true);
	 * assert(cards.length, 1002);
	 *
	 *
	 * @example
	 * // You can get a vanilla card by name using this
	 * cards = cards.filter(c => c.name === "Brann Bronzebeard");
	 * assert(cards.length, 15);
	 *
	 * cards = filter(cards, true, true);
	 * assert(cards.length, 1);
	 */
	filter(
		cards: VanillaCard[],
		uncollectible = true,
		dangerous = false,
		keepHeroSkins = false,
	): VanillaCard[] {
		let vanillaCards = cards;

		if (uncollectible) {
			vanillaCards = vanillaCards.filter((a) => a.collectible);
		}

		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("Prologue"));

		// Idk what 'PVPDR' means, but ok
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("PVPDR"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("DRGA_BOSS"));

		// Battlegrounds
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("BG"));

		// Tavern Brawl
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("TB"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("LOOTA_"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("DALA_"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("GILA_"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("BOTA_"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("TRLA_"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("DALA_"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("ULDA_"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("BTA_BOSS_"));
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("Story_"));

		// Book of mercenaries
		vanillaCards = vanillaCards.filter((a) => !a.id.startsWith("BOM_"));
		vanillaCards = vanillaCards.filter(
			(a) => !a.mechanics || !a.mechanics.includes("DUNGEON_PASSIVE_BUFF"),
		);
		vanillaCards = vanillaCards.filter(
			(a) =>
				a.set &&
				!["battlegrounds", "placeholder", "vanilla", "credits"].includes(
					a.set.toLowerCase(),
				),
		);
		vanillaCards = vanillaCards.filter(
			(a) => a.set && !a.set.includes("PLACEHOLDER_"),
		);
		vanillaCards = vanillaCards.filter((a) => !a.mercenariesRole);

		vanillaCards = vanillaCards.filter((a) => !a.battlegroundsBuddyDbfId);
		vanillaCards = vanillaCards.filter(
			(a) => !a.battlegroundsDarkmoonPrizeTurn,
		);
		vanillaCards = vanillaCards.filter((a) => !a.battlegroundsHero);
		vanillaCards = vanillaCards.filter((a) => !a.battlegroundsNormalDbfId);
		vanillaCards = vanillaCards.filter((a) => !a.battlegroundsPremiumDbfId);
		vanillaCards = vanillaCards.filter((a) => !a.battlegroundsSkinParentId);
		vanillaCards = vanillaCards.filter((a) => !a.isBattlegroundsBuddy);

		const filteredCards: VanillaCard[] = [];

		for (const vanillaCard of vanillaCards) {
			// If the set is `HERO_SKINS`, only include it if it's id is `HERO_xx`, where the x's are a number.
			if (vanillaCard.set?.includes("HERO_SKINS")) {
				if (keepHeroSkins && /HERO_\d\d/.test(vanillaCard.id)) {
					filteredCards.push(vanillaCard);
				}

				continue;
			}

			filteredCards.push(vanillaCard);
		}

		vanillaCards = filteredCards;

		if (dangerous) {
			// If any of the cards have a 'howToEarn' field, filter away any cards that don't have that
			const newCards = vanillaCards.filter((a) => a.howToEarn);
			if (newCards.length > 0) {
				vanillaCards = newCards;
			}
		}

		return vanillaCards;
	},
};

export const cardFunctions = {
	/**
	 * Vanilla card related functions
	 */
	vanilla,

	/**
	 * Returns if `classes` includes `cardClass` (also Neutral logic).
	 */
	validateClasses(classes: CardClass[], cardClass: CardClass): boolean {
		if (classes.includes("Neutral")) {
			return true;
		}

		return classes.includes(cardClass);
	},

	/**
	 * Returns if the `cardTribe` is `tribe` or 'All'
	 *
	 * @example
	 * assert.equal(card.tribe, "Beast");
	 *
	 * // This should return true
	 * const result = matchTribe(card.tribe, "Beast");
	 * assert.equal(result, true);
	 *
	 * @example
	 * assert.equal(card.tribe, "All");
	 *
	 * // This should return true
	 * const result = matchTribe(card.tribe, "Beast");
	 * assert.equal(result, true);
	 */
	matchTribe(cardTribe: MinionTribe, tribe: MinionTribe): boolean {
		// I'm not sure why you would set `tribe` to `All`, but I'll support it anyway.
		if (cardTribe === "All" || tribe === "All") {
			return true;
		}

		return cardTribe === tribe;
	},

	/**
	 * Validates the blueprints.
	 *
	 * @returns If one or more blueprints were found invalid.
	 */
	runBlueprintValidator(): boolean {
		// Validate the cards
		let valid = true;
		for (const blueprint of game.blueprints) {
			const errorMessage = this.validateBlueprint(blueprint);

			// Success
			if (errorMessage === true) {
				continue;
			}

			// Validation error
			console.log(
				"<red>Card <bold>'%s'</bold> (%s) is invalid since %s</red>",
				blueprint.name,
				blueprint.id,
				errorMessage,
			);

			valid = false;
		}

		return valid;
	},

	/**
	 * Returns all classes in the game
	 */
	async getClasses(): Promise<CardClassNoNeutral[]> {
		const cards = await Promise.all(
			(await Card.allWithTags(["starting_hero"])).map(async (hero) => {
				const unsuppress = game.event.suppress("CreateCard");
				const card = await hero.imperfectCopy();
				unsuppress();

				return card;
			}),
		);

		return cards.map((card) => card.classes[0]) as CardClassNoNeutral[];
	},

	/**
	 * Returns the result of the galakrond formula:
	 *
	 * 1. Returns 1 if `invokeCount` is less than or equal to 2.
	 * 2. Otherwise, returns 2 if `invokeCount` is less than or equal to 4.
	 * 3. Otherwise, returns 4.
	 *
	 * @param invokeCount How many times that the card has been invoked.
	 */
	galakrondFormula(invokeCount: number): number {
		return (
			Math.min(
				4,
				Math.ceil((invokeCount + 1) / 2) + Math.round(invokeCount * 0.15),
			) || 1
		);
	},

	/**
	 * Validates a blueprint
	 *
	 * @returns Success / Error message
	 */
	validateBlueprint(blueprint: Blueprint): string | boolean {
		// These are the required fields for all card types.
		const requiredFieldsTable: { [x in CardType]: string[] } = {
			Minion: ["attack", "health", "tribe"],
			Spell: ["spellSchool"],
			Weapon: ["attack", "health"],
			Hero: ["armor", "heropowerId"],
			Location: ["durability", "cooldown"],
			Heropower: ["heropower"],
			Undefined: [],
		};

		// We trust the typescript compiler to do most of the work for us, but the type specific code is handled here.
		const required = requiredFieldsTable[blueprint.type];

		const unwanted = Object.keys(requiredFieldsTable);
		game.functions.util.remove(unwanted, blueprint.type);
		game.functions.util.remove(unwanted, "Undefined");

		let result: string | boolean = true;
		for (const field of required) {
			// Field does not exist
			const value = blueprint[field as keyof Blueprint];
			if (!value && value !== 0) {
				result = `<bold>'${field}' DOES NOT</bold> exist for that card.`;
			}
		}

		for (const key of unwanted) {
			const fields = requiredFieldsTable[key as CardType];

			for (const field of fields) {
				// We already require that field. For example, both minions and weapons require stats
				if (required.includes(field)) {
					continue;
				}

				// We have an unwanted field

				if (blueprint[field as keyof Blueprint]) {
					result = `<bold>${field} SHOULD NOT</bold> exist on card type ${blueprint.type}.`;
				}
			}
		}

		return result;
	},

	/**
	 * Generates an ids file in `cards/ids.ts`. This is used in `game.cardIds`.
	 *
	 * Don't use this function manually unless you know what you're doing.
	 */
	generateIdsFile(): void {
		let idsContent =
			"// This file has been automatically generated. Do not change this file.\n\n";
		idsContent += "export const cardIds = {\n";
		idsContent += "\tnull0: 0,";

		for (const card of game.cards.sort((a, b) => a.id - b.id)) {
			const numberIdentifier = /^\d/.test(card.name) ? "n" : "";
			idsContent += `\n\t${numberIdentifier}${game.lodash.camelCase(card.name)}${card.id}: ${card.id},`;
		}

		idsContent += "\n};\n";

		game.functions.util.fs("write", "/cards/ids.ts", idsContent);
	},

	/**
	 * Asks the user to select a location card to use, and activate it.
	 *
	 * @returns Success
	 */
	async promptUseLocation(): Promise<
		boolean | "nolocations" | "invalidtype" | "cooldown" | "refund"
	> {
		const locations = game.player.board.filter((m) => m.type === "Location");
		if (locations.length <= 0) {
			return "nolocations";
		}

		const location = await game.functions.interact.promptTargetCard(
			"Which location do you want to use?",
			undefined,
			"friendly",
			["allowLocations"],
		);

		if (!location) {
			return "refund";
		}

		if (location.type !== "Location") {
			return "invalidtype";
		}

		if (location.cooldown && location.cooldown > 0) {
			return "cooldown";
		}

		if ((await location.activate("use")) === Card.REFUND) {
			return "refund";
		}

		if (location.durability === undefined) {
			throw new Error("Location card's durability is undefined");
		}

		location.durability -= 1;
		location.cooldown = location.backups.init.cooldown;
		return true;
	},

	/**
	 * Asks the player to mulligan their cards
	 *
	 * @param player The player to ask
	 *
	 * @returns A string of the indexes of the cards the player mulligan'd
	 */
	async promptMulligan(player: Player): Promise<string> {
		await game.functions.interact.printGameState(player);

		let sb = "\nChoose the cards to mulligan (1, 2, 3, ...):\n";
		if (!game.config.general.debug) {
			sb +=
				"<gray>(Example: 13 will mulligan the cards with the ids 1 and 3, 123 will mulligan the cards with the ids 1, 2 and 3, just pressing enter will not mulligan any cards):</gray>\n";
		}

		const input = player.ai ? player.ai.mulligan() : await game.input(sb);
		await player.mulligan(input);

		return input;
	},

	/**
	 * Asks the current player a `prompt` and shows 3 cards from their deck for the player to choose, the chosen card will be added to the top of their deck
	 *
	 * @param prompt The prompt to ask the user
	 *
	 * @returns The card chosen
	 */
	async promptDredge(
		prompt = "Choose a card to Dredge:",
	): Promise<Card | undefined> {
		// Look at the bottom three cards of the deck and put one on the top.
		const cards = game.player.deck.slice(0, 3);

		// Check if ai
		if (game.player.ai) {
			const card = game.player.ai.dredge(cards);
			if (!card) {
				return undefined;
			}

			// Removes the selected card from the players deck.
			game.functions.util.remove(game.player.deck, card);
			game.player.deck.push(card);

			return card;
		}

		await game.functions.interact.printGameState(game.player);

		console.log("\n%s", prompt);

		if (cards.length <= 0) {
			return undefined;
		}

		for (const [index, card] of cards.entries()) {
			console.log(await card.readable(index + 1));
		}

		const choice = await game.input("> ");

		const cardId = game.lodash.parseInt(choice) - 1;
		const card = cards[cardId];

		if (!card) {
			return this.promptDredge(prompt);
		}

		// Removes the selected card from the players deck.
		game.functions.util.remove(game.player.deck, card);
		game.player.deck.push(card);

		return card;
	},

	/**
	 * Asks the user a "prompt", show them "amount" cards. The cards are chosen from "cards".
	 *
	 * @param prompt The prompt to ask
	 * @param cards The cards to choose from
	 * @param filterClassCards If it should filter away cards that do not belong to the player's class. Keep this at default if you are using `functions.card.getAll()`, disable this if you are using either player's deck / hand / graveyard / etc...
	 * @param amount The amount of cards to show
	 * @param _static_cards Do not use this variable, keep it at default
	 *
	 * @returns The card chosen.
	 */
	async promptDiscover(
		prompt: string,
		cards: Card[] = [],
		filterClassCards = true,
		amount = 3,
		_static_cards: Card[] = [],
	): Promise<Card | undefined> {
		let actualCards = cards;

		await game.functions.interact.printGameState(game.player);
		let values: Card[] = _static_cards;

		if (actualCards.length <= 0) {
			actualCards = await Card.all();
		}

		if (actualCards.length <= 0 || !actualCards) {
			return undefined;
		}

		if (filterClassCards) {
			/*
			 * We need to filter the cards
			 * of the filter function
			 */
			actualCards = actualCards.filter((card) =>
				game.functions.card.validateClasses(
					card.classes,
					game.player.heroClass,
				),
			);
		}

		// No cards from previous discover loop, we need to generate new ones.
		if (_static_cards.length === 0) {
			values = game.lodash.sampleSize(actualCards, amount);
			values = values.map((c) => {
				if (c instanceof Card) {
					c.perfectCopy();
				}

				return c;
			});
		}

		if (values.length <= 0) {
			return undefined;
		}

		if (game.player.ai) {
			return game.player.ai.discover(values);
		}

		console.log("\n%s:", prompt);

		for (const [index, card] of values.entries()) {
			console.log(await card.readable(index + 1));
		}

		const choice = await game.input();

		if (!values[game.lodash.parseInt(choice) - 1]) {
			/*
			 * Invalid input
			 * We still want the user to be able to select a card, so we force it to be valid
			 */
			return this.promptDiscover(
				prompt,
				actualCards,
				filterClassCards,
				amount,
				values,
			);
		}

		const card = values[game.lodash.parseInt(choice) - 1];

		return card;
	},

	/**
	 * Verifies that the diy card has been solved.
	 *
	 * @param condition The condition where, if true, congratulates the user
	 * @param card The DIY card itself
	 *
	 * @returns Success
	 */
	async verifyDiySolution(condition: boolean, card: Card): Promise<boolean> {
		if (card.owner.ai) {
			return false;
		}

		let success = false;

		if (condition) {
			console.log("Success! You did it, well done!");
			success = true;
		} else {
			const match = /DIY (\d+)/.exec(card.name);
			const index = match ? match[1] : "unknown";

			console.log(
				"Hm. This card doesn't seem to do what it's supposed to do... Maybe you should try to fix it? The card is in: './cards/Examples/DIY/%s.ts'.",
				index,
			);
		}

		await game.pause();
		return success;
	},
};
