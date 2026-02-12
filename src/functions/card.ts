import { Card } from "@Game/card.ts";
import { type Metadata, PackValidationResult } from "@Game/types/pack";
import {
	Ability,
	type Blueprint,
	Class,
	Event,
	Tag,
	Tribe,
	Type,
	type VanillaCard,
} from "@Game/types.ts";
import { resolve } from "node:path";
import { parseTags } from "chalk-tags";

const vanilla = {
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
		if (await game.functions.util.fs("exists", fileLocation)) {
			return JSON.parse(
				(await game.functions.util.fs("readFile", fileLocation)) as string,
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
	validateClasses(classes: Class[], cardClass: Class): boolean {
		if (classes.includes(Class.Neutral)) {
			return true;
		}

		return classes.includes(cardClass);
	},

	/**
	 * Returns if the `cardTribes` includes `tribe` or 'All'
	 *
	 * @example
	 * assert.equal(card.tribes, [Tribe.Beast]);
	 *
	 * // This should return true
	 * const result = matchTribe(card.tribes, Tribe.Beast);
	 * assert.equal(result, true);
	 *
	 * @example
	 * assert.equal(card.tribes, Tribe.All);
	 *
	 * // This should return true
	 * const result = matchTribe(card.tribes, Tribe.Beast);
	 * assert.equal(result, true);
	 */
	matchTribe(cardTribes: Tribe[], tribe: Tribe): boolean {
		// I'm not sure why you would set `tribe` to `All`, but I'll support it anyway.
		if (cardTribes.includes(Tribe.All) || tribe === Tribe.All) {
			return true;
		}

		return cardTribes.includes(tribe);
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
				"<red>ERROR: Card <bold>'%s'</bold> (%s) is invalid since %s</red>",
				blueprint.name,
				blueprint.id,
				errorMessage,
			);

			valid = false;
		}

		return valid;
	},

	/**
	 * Returns the name of all classes in the game
	 */
	// TODO: Replace this with `Object.values(Class)`
	async getClasses(): Promise<string[]> {
		const cards = await Promise.all(
			(await Card.allWithTags(Tag.StartingHero)).map(async (hero) => {
				const unsuppress = game.event.suppress(Event.CreateCard);
				const card = await hero.imperfectCopy();
				unsuppress();

				return card;
			}),
		);

		return cards.map((card) => card.classes[0]);
	},

	/**
	 * Returns the result of calling `readable` on all cards.
	 */
	async readables(cards: Card[]): Promise<string[]> {
		return await Promise.all(
			cards.map(async (c, i) => parseTags(await c.readable(i + 1))),
		);
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
		const requiredFieldsTable: {
			[x in Type]: (keyof Blueprint)[];
		} = {
			[Type.Minion]: ["attack", "health", "tribes"],
			[Type.Spell]: ["spellSchools"],
			[Type.Weapon]: ["attack", "health"],
			[Type.Hero]: ["armor", "heropowerId"],
			[Type.Location]: ["durability", "cooldown"],
			[Type.HeroPower]: [Ability.HeroPower],
			[Type.Enchantment]: [
				"enchantmentPriority",
				Ability.EnchantmentApply,
				Ability.EnchantmentRemove,
			],
			[Type.Undefined]: [],
		};

		// We trust the typescript compiler to do most of the work for us, but the type specific code is handled here.
		const required = requiredFieldsTable[blueprint.type];

		// NOTE: I don't know why Object.keys returns `string[]` here but ok.
		const unwanted = Object.keys(requiredFieldsTable) as unknown as Type[];
		game.functions.util.remove(unwanted, blueprint.type);
		game.functions.util.remove(unwanted, Type.Undefined);

		let result: string | boolean = true;
		for (const field of required) {
			// Field does not exist
			const value = blueprint[field as keyof Blueprint];
			if (!value && value !== 0) {
				result = `<bold>'${field}' DOES NOT</bold> exist for that card.`;
			}
		}

		for (const key of unwanted) {
			const fields = requiredFieldsTable[key as Type];

			for (const field of fields) {
				// We already require that field. For example, both minions and weapons require stats
				if (required.includes(field)) {
					continue;
				}

				// We have an unwanted field
				if (blueprint[field as keyof Blueprint]) {
					result = `<bold>'${field}' SHOULD NOT</bold> exist on card type ${blueprint.type}.`;
				}
			}
		}

		return result;
	},

	/**
	 * Gets the pack metadata associated with a card.
	 *
	 * @param filePath The path to the card. Should end in ".ts"
	 * @returns The metadata, or null if no metadata was found. In this case, the card should be treated as not belonging to any pack.
	 */
	async getPackMetadataFromCardPath(
		filePath: string,
	): Promise<Metadata | null> {
		// TODO: If this doesn't actually give the base path, fallback to checking every parent directory within the Hearthstone.js folder.
		const basePath = filePath.replace(
			/^(.*?)@(.*?)[/\\](.*?)[/\\].*$/,
			"$1@$2/$3",
		);
		const packPath = resolve(basePath, "pack.json5");

		if (!(await game.functions.util.fs("exists", packPath))) {
			// No metadata file found.
			return null;
		}

		const packContent = (await game.functions.util.fs(
			"readFile",
			packPath,
		)) as string;
		const metadata = Bun.JSON5.parse(packContent) as Metadata;

		return metadata;
	},

	/**
	 * Check if the pack associated with a card is valid.
	 *
	 * @param filePath The file path of the card.
	 * @returns The validation result.
	 */
	async validatePackFromPath(filePath: string): Promise<PackValidationResult> {
		const metadata =
			await game.functions.card.getPackMetadataFromCardPath(filePath);
		if (!metadata) {
			// A non-existant pack is a valid pack!
			return PackValidationResult.NoPack;
		}

		// Check if the game version is correct.
		if (
			!Bun.semver.satisfies(
				metadata.versions.game,
				`^${game.functions.info.version().version[0]}.0.0`,
			)
		) {
			return PackValidationResult.InvalidGameVersion;
		}

		return PackValidationResult.Success;
	},

	/**
	 * Generates an ids file in `cards/ids.ts`. This is used in `game.ids`.
	 *
	 * Don't use this function manually unless you know what you're doing.
	 */
	async generateIdsFile(): Promise<void> {
		let idsContent =
			"// This file has been automatically generated. Do not change this file.\n\n";
		idsContent += "export default {\n";
		idsContent += '\tnull: "00000000-0000-0000-0000-000000000000",';

		const cards: { name: string; id: string; packMetadata: Metadata | null }[] =
			[];

		let ids: Record<string, Record<string, Record<string, string[]>>> = {};

		const sortObject = (object: any) => {
			// Sort the cards alphabetically.
			const sortedEntries = Object.entries(object).sort((a, b) =>
				a[0].localeCompare(b[0]),
			);

			object = sortedEntries.reduce((acc, [key, value]) => {
				acc[key] = value;
				return acc;
			}, {} as any);

			return object;
		};

		// Collect the cards.
		await game.functions.util.searchCardsFolder(async (path, content, file) => {
			const nameRegex = /name: "(.+)"/;
			const nameMatch = nameRegex.exec(content);
			if (!nameMatch) {
				throw new Error(`No name found in '${path}'.`);
			}

			const idRegex = /id: "([0-9a-f-]+)"/;
			const idMatch = idRegex.exec(content);
			if (!idMatch) {
				throw new Error(`No id found in '${path}'.`);
			}

			const name = nameMatch[1];
			const id = idMatch[1];

			const packMetadata =
				await game.functions.card.getPackMetadataFromCardPath(path);

			cards.push({
				name,
				id,
				packMetadata,
			});

			const numberIdentifier = /^\d/.test(name) ? "_" : "";
			const formattedName = `${numberIdentifier}${game.lodash.snakeCase(name)}`;

			if (packMetadata) {
				if (!ids[packMetadata.author]) {
					ids[packMetadata.author] = { [packMetadata.name]: {} };
				}
				if (!ids[packMetadata.author][packMetadata.name]) {
					ids[packMetadata.author][packMetadata.name] = {};
				}
				if (!ids[packMetadata.author][packMetadata.name][formattedName]) {
					ids[packMetadata.author][packMetadata.name][formattedName] = [];
				}

				ids[packMetadata.author][packMetadata.name][formattedName].push(id);

				// Sort the ids alphabetically.
				ids[packMetadata.author][packMetadata.name][formattedName].sort();

				// Sort the cards alphabetically.
				ids[packMetadata.author][packMetadata.name] = sortObject(
					ids[packMetadata.author][packMetadata.name],
				);

				// Sort the packs alphabetically.
				ids[packMetadata.author] = sortObject(ids[packMetadata.author]);
			}
		});

		// Sort the authors alphabetically.
		ids = sortObject(ids);

		idsContent += "\n";

		for (const [author, packs] of Object.entries(ids)) {
			idsContent += `\t${author}: {\n`;
			for (const [pack, cards] of Object.entries(packs)) {
				idsContent += `\t\t${pack}: {\n`;
				for (const [card, cardIds] of Object.entries(cards)) {
					idsContent += `\t\t\t${card}: ["${cardIds.join('", "')}"],\n`;
				}
				idsContent += "\t\t},\n";
			}
			idsContent += "\t},\n";
		}

		// Add the "all" section.
		idsContent += "\tall: {";

		for (const card of cards.sort((a, b) => a.id.localeCompare(b.id))) {
			const numberIdentifier = /^\d/.test(card.name) ? "n" : "";
			idsContent += `\n\t\t${numberIdentifier}${game.lodash.snakeCase(card.name)}_${card.id.replaceAll("-", "_")}: "${card.id}",`;
		}

		idsContent += "\n\t},\n};\n";

		game.functions.util.fs("writeFile", "/cards/ids.ts", idsContent);
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
