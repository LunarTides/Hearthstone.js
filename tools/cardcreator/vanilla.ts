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
import { input, number, Separator, search } from "@inquirer/prompts";
import { parseTags } from "chalk-tags";
import * as hub from "../../hub.ts";
import * as lib from "./lib.ts";

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
	let races: Tribe[] = [];
	if (card.races) {
		races = card.races.map((r) => game.lodash.startCase(r) as Tribe);
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

	const classes = (await game.functions.card.getClasses()) as Class[];
	classes.push(Class.Neutral);

	while (!classes.includes(cardClass)) {
		cardClass = game.lodash.startCase(
			await input({
				message: parseTags(
					"<red>Was not able to find the class of this card.\nWhat is the class of this card? </red>",
				),
			}),
		) as Class;
	}

	if (type === Type.Hero) {
		// Add the hero power
		console.log("<green>Adding the hero power</green>");

		const heroPower = (await game.functions.card.vanilla.getAll()).find(
			(c) => c.dbfId === card.heroPowerDbfId,
		);

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
		id: game.ids.null,
	};

	switch (type) {
		case Type.Minion: {
			blueprint = Object.assign(blueprint, {
				attack,
				health,
				tribes: races,
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
	const vanillaCards = await game.functions.card.vanilla.getAll();

	while (true) {
		hub.watermark(false);

		const cardType = await game.prompt.customSelectEnum(
			"Choose a type to filter the card using.",
			[...Object.keys(Type).filter((t) => t !== "Undefined"), "Unknown (Slow)"],
		);
		if (cardType === "Back") {
			return false;
		}

		const answer = await game.prompt.customSelect(
			"Do you want to filter by cost?",
			["Type in cost", "Unknown (Slow)"],
		);
		let cardCost: number | undefined;

		if (answer === "0") {
			cardCost = await number({
				message: "How much does the card cost?",
			});
		}

		let dbfId = await search({
			message: "Search vanilla cards.",
			source: (value) => {
				const filteredCards = vanillaCards
					.filter(
						(c) =>
							(!value || c.name.toLowerCase().includes(value?.toLowerCase())) &&
							(c.cost === undefined ||
								cardCost === undefined ||
								c.cost === cardCost) &&
							(cardType === "Unknown (Slow)" ||
								c.type?.toLowerCase() === cardType.toLowerCase()),
					)
					.map((c) => ({
						name: parseTags(
							`<cyan>{${c.cost ?? "None"}}</cyan> ${c.name}${c.text ? ` (${c.text.replaceAll("[x]", "").replaceAll("\n", "")})` : ""} <yellow>(${game.lodash.startCase(c.type?.toLowerCase())})</yellow> <gray>(${c.collectible ? "Collectible" : "Uncollectible"}) [${c.dbfId}]</gray>`,
						),
						value: c.dbfId,
					}));

				const cards = [
					{
						name: "Type name / dbfId",
						value: -2,
						description:
							"Manually type in the name or dbfId of the vanilla card you want to import.",
					},
					{
						name: "Back",
						value: -1,
					},
					new Separator(),
					...filteredCards,
				];

				return cards;
			},
			pageSize: 15,
		});
		if (dbfId === -1) {
			continue;
		}
		if (dbfId === -2) {
			const name = await input({
				message: "Name / dbfId",
				validate: (value) =>
					vanillaCards.some(
						(c) =>
							c.name.toLowerCase() === value.toLowerCase() ||
							c.dbfId === parseInt(value, 10),
					),
			});

			dbfId = vanillaCards.find(
				(c) =>
					c.name.toLowerCase() === name.toLowerCase() ||
					c.dbfId === parseInt(name, 10),
			)!.dbfId;
		}

		const card = vanillaCards.find((c) => c.dbfId === dbfId)!;
		await create(card, debug, overrideType);
		break;
	}

	return true;
}
