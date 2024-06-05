import { type Card, CardError, type Player } from "@Game/internal.js";
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
	 * Returns all cards with the name `name`.
	 *
	 * @param refer If this should call `getCardById` if it doesn't find the card from the name
	 *
	 * @example
	 * const cards = getAllFromName('The Coin');
	 *
	 * assert.ok(card[0] instanceof Card);
	 * assert.equal(card[0].name, 'The Coin');
	 */
	getAllFromName(name: string, refer = true): Card[] {
		const id = this.getFromId(game.lodash.parseInt(name));

		/*
		 * For some reason, "10 Mana" turns into 10 when passed through `parseInt`.
		 * So we check if it has a space
		 */
		if (id && refer && !name.includes(" ")) {
			return [id];
		}

		return this.getAll(false).filter(
			(c) => c.name.toLowerCase() === name.toLowerCase(),
		);
	},

	/**
	 * Returns the card with the id of `id`.
	 *
	 * @example
	 * const card = getFromId(2);
	 *
	 * assert.ok(card instanceof Card);
	 * assert.equal(card.name, 'The Coin');
	 */
	getFromId(id: number): Card | undefined {
		return this.getAll(false).find((c) => c.id === id);
	},

	/**
	 * Creates a card with the given name for the specified player. If there are multiple cards with the same name, this will use the first occurrence.
	 *
	 * @returns The created card, or undefined if no card is found.
	 */
	getFromName(name: string, player: Player): Card | undefined {
		const cards = this.getAllFromName(name);
		if (cards.length <= 0) {
			return undefined;
		}

		return game.newCard(cards[0].id, player, true);
	},

	/**
	 * Returns all cards added to Hearthstone.js
	 *
	 * @param uncollectible If it should filter out all uncollectible cards
	 */
	getAll(uncollectible = true): Card[] {
		// Don't broadcast CreateCard event here since it would spam the history and log files
		if (game.cards.length <= 0) {
			game.cards = game.blueprints.map((card) =>
				game.newCard(card.id, game.player, true),
			);

			this.generateIdsFile();
		}

		return game.cards.filter((c) => c.collectible || !uncollectible);
	},

	/**
	 * Returns the card with the given UUID wherever it is.
	 *
	 * This searches both players' deck, hand, board, and graveyard.
	 *
	 * @param uuid The UUID to search for. This matches if the card's UUID starts with the given UUID (this).
	 * @returns The card that matches the UUID, or undefined if no match is found.
	 */
	findFromUUID(uuid: string): Card | undefined {
		let card: Card | undefined;

		/**
		 * Searches for a UUID in the given array of cards and updates the 'card' variable if found.
		 *
		 * @param where The array of cards to search
		 */
		function lookForUUID(where: Card[]): void {
			const foundCard = where.find((card) => card.uuid.startsWith(uuid));

			if (foundCard) {
				card = foundCard;
			}
		}

		for (const player of [game.player1, game.player2]) {
			lookForUUID(player.deck);
			lookForUUID(player.hand);
			lookForUUID(player.board);
			lookForUUID(player.graveyard);
		}

		return card;
	},

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
		// If the card's tribe is "All".
		if (cardTribe === "All") {
			return true;
		}

		return cardTribe.includes(tribe);
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
	 * Creates and returns a jade golem with the correct stats and cost for the player
	 *
	 * @param plr The jade golem's owner
	 *
	 * @returns The jade golem
	 */
	createJade(plr: Player): Card {
		if (plr.jadeCounter < 30) {
			plr.jadeCounter += 1;
		}

		const count = plr.jadeCounter;
		const cost = count < 10 ? count : 10;

		const jade = game.newCard(game.cardIds.jadeGolem85, plr);
		jade.setStats(count, count);
		jade.cost = cost;

		return jade;
	},

	/**
	 * Returns all classes in the game
	 */
	getClasses(): CardClassNoNeutral[] {
		return game.cardCollections.classes.map(
			(heroId) => game.newCard(heroId, game.player, true).classes[0],
		) as CardClassNoNeutral[];
	},

	/**
	 * Returns the result of the galakrond formula
	 *
	 * @param invokeCount How many times that the card has been invoked.
	 */
	galakrondFormula(invokeCount: number): number {
		const x = invokeCount;
		const y = Math.ceil((x + 1) / 2) + Math.round(x * 0.15);

		return y || 1;
	},

	/**
	 * Creates a new CardError with the provided message.
	 */
	createCardError(message: string): CardError {
		return new CardError(message);
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
	 * Imports all cards from a folder
	 *
	 * @returns Success
	 */
	importAll(): boolean {
		game.functions.util.searchCardsFolder((fullPath) => {
			const blueprint = require(fullPath).blueprint as Blueprint;
			game.blueprints.push(blueprint);
		});

		// Remove falsy values
		game.blueprints = game.blueprints.filter(Boolean);

		if (!this.runBlueprintValidator()) {
			throw new Error(
				"Some cards are invalid. Please fix these issues before playing.",
			);
		}

		return true;
	},

	/**
	 * Reloads all cards
	 *
	 * @returns Success
	 */
	reloadAll(): boolean {
		game.blueprints = [];

		for (const key of Object.keys(require.cache)) {
			if (!key.includes("/cards/")) {
				continue;
			}

			delete require.cache[key];
		}

		return this.importAll();
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
		idsContent += "    null0: 0,";

		for (const card of game.cards.sort((a, b) => a.id - b.id)) {
			const numberIdentifier = /^\d/.test(card.name) ? "n" : "";
			idsContent += `\n    ${numberIdentifier}${game.lodash.camelCase(card.name)}${card.id}: ${card.id},`;
		}

		idsContent += "\n};\n";

		game.functions.util.fs("write", "/cards/ids.ts", idsContent);
	},
};
