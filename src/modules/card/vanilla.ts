import {
	type Blueprint,
	Class,
	EnchantmentPriority,
	Rarity,
	SpellSchool,
	type Tribe,
	Type,
	type VanillaCard,
} from "@Game/types.ts";
import { parseTags } from "chalk-tags";

export const vanilla = {
	/**
	 * Returns all cards added to Vanilla Hearthstone.
	 *
	 * This will throw an error if the user has not run the vanilla card generator,
	 *
	 * @example
	 * const vanillaCards = await getAll();
	 *
	 * for (const vanillaCard of vanillaCard) {
	 *     console.log(vanillaCard.dbfId);
	 * }
	 *
	 * @returns The vanilla cards
	 */
	async getAll(): Promise<VanillaCard[]> {
		const fileLocation = "/vanillacards.json";
		if (await game.fs.call("exists", fileLocation)) {
			return JSON.parse(
				(await game.fs.call("readFile", fileLocation)) as string,
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
			(a) => !a.mechanics?.includes("DUNGEON_PASSIVE_BUFF"),
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

	/**
	 * Turn a Vanilla card into a Hearthstone.js blueprint.
	 *
	 * @param card The card to convert
	 * @param options
	 * @returns The blueprint
	 */
	async fromVanilla(
		card: VanillaCard,
		options = {
			userInput: false,
		},
	): Promise<Blueprint> {
		// Harvest info
		let cardClass = game.lodash.capitalize(
			card.cardClass ?? "Neutral",
		) as Class;
		const collectible = card.collectible ?? false;
		const cost = card.cost ?? 0;
		const name = card.name;
		let rarity = Rarity.Free;
		if (card.rarity) {
			rarity = game.lodash.capitalize(card.rarity) as Rarity;
		}

		let text = card.text ?? "";
		let typeString = game.lodash.capitalize(card.type);
		if (typeString === "Hero_power") {
			typeString = "HeroPower" as typeof typeString;
		}

		const type = typeString as Type;

		// Minion info
		const attack = card.attack ?? -1;
		const health = card.health ?? -1;
		let tribes: Tribe[] = [];
		if (card.races) {
			tribes = card.races.map((r) => game.lodash.startCase(r) as Tribe);
		}

		// Spell info
		let spellSchools = [SpellSchool.None];
		if (card.spellSchool) {
			spellSchools = [game.lodash.startCase(card.spellSchool) as SpellSchool];
		}

		// Weapon Info
		const durability = card.durability ?? -1;

		// Modify the text
		text = text.replaceAll("\n", " ");
		text = text.replaceAll("[x]", "");

		const classes = (await game.card.getClasses()) as Class[];
		classes.push(Class.Neutral);

		while (!classes.includes(cardClass)) {
			if (options.userInput) {
				cardClass = game.lodash.startCase(
					await game.input({
						message: parseTags(
							"<red>Was not able to find the class of this card.\nWhat is the class of this card? </red>",
						),
					}),
				) as Class;
			} else {
				throw new Error("Vanilla card has invalid class.");
			}
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
			id: game.ids.null,
		};

		switch (type) {
			case Type.Minion: {
				blueprint = Object.assign(blueprint, {
					attack,
					health,
					tribes: tribes,
				});

				break;
			}

			case Type.Spell: {
				blueprint = Object.assign(blueprint, {
					spellSchools,
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
					// TODO: Get heropower id.
					heropowerId: game.ids.null,
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

			case Type.Enchantment: {
				blueprint = Object.assign(blueprint, {
					enchantmentPriority: EnchantmentPriority.Normal,
				});

				break;
			}

			case Type.HeroPower:
			case Type.Undefined: {
				break;
			}
		}

		return blueprint;
	},
};
