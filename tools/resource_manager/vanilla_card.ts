import { createGame } from "@Game/game.ts";
import { Type, type VanillaCard } from "@Game/types.ts";
import { number, Separator, search } from "@inquirer/prompts";
import { parseTags } from "chalk-tags";
import * as hub from "../../hub.ts";
import {
	create as createResource,
	postCreate,
} from "../../universe/emergence/create/lib.ts";

if (import.meta.main) {
	await createGame();
}

/**
 * Create a card from a vanilla card.
 *
 * @param card The vanilla card
 * @param debug If it should use debug mode
 */
export async function create(card: VanillaCard, debug: boolean): Promise<void> {
	const blueprint = await game.card.vanilla.fromVanilla(card, {
		userInput: true,
	});

	if (blueprint.type === Type.Hero) {
		// Add the hero power
		console.log("<green>Adding the hero power</green>");

		const heroPower = (await game.card.vanilla.getAll()).find(
			(c) => c.dbfId === card.heroPowerDbfId,
		);

		if (!heroPower) {
			throw new Error("No hero power found");
		}

		await create(heroPower, debug);
	}

	const result = await createResource("card", blueprint);
	await postCreate("card", blueprint);

	if (card.text) {
		game.os.runCommand(`${game.config.general.editor} "${result.path}"`);
	}
}

/**
 * Prompt the user to pick a card, then create it.
 *
 * @returns If a card was created
 */
export async function main(debug = false): Promise<boolean> {
	const vanillaCards = await game.card.vanilla.getAll();

	while (true) {
		hub.watermark(false);

		const typeResult = await game.prompt.customSelectEnum(
			"Choose a type to filter the card using.",
			[...Object.keys(Type), "Unknown (Slow)"],
		);
		const cardType = typeResult.value;
		if (cardType === "Back") {
			return false;
		}

		let cardCost: number | undefined;

		const { backedOut } = await game.prompt.createUILoop(
			{
				message: "Do you want to filter by cost?",
			},
			async () => [
				{
					tab: {
						index: 1,
						name: "Filter Type",
					},
					items: [
						{
							name: "Type in cost",
							onSelect: async () => {
								cardCost = await number({
									message: "How much does the card cost?",
								});
								return false;
							},
						},
						{
							name: "Unknown (Slow)",
							onSelect: async () => {
								return false;
							},
						},
					],
				},
			],
		);
		if (backedOut) {
			return false;
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
			const name = await game.input({
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
		await create(card, debug);
		break;
	}

	return true;
}

if (import.meta.main) {
	await main();
}
