import { Card } from "@Game/card.ts";
import {
	Class,
	type CommandList,
	Event,
	type GameConfig,
	Rarity,
	Rune,
} from "@Game/types.ts";
import util from "node:util";
import { resumeTagParsing, stopTagParsing } from "chalk-tags";
import * as hub from "../hub.ts";

enum ViewType {
	Cards = "Cards",
	Deck = "Deck",
}

enum SortOrder {
	Ascending = "Ascending",
	Descending = "Descending",
}

enum CardIdOrName {
	Id = "Id",
	Name = "Name",
}

enum DeckcodeFormat {
	Vanilla = "Vanilla",
	JS = "JS",
}

const config = game.config;
const player = game.player;
const classes = await game.functions.card.getClasses();
const cards = await Card.all(game.config.advanced.dcShowUncollectible);

let chosenClass: Class;
let filteredCards: Card[] = [];

let deck: Card[] = [];
let runes: Rune[] = [];

const warnings = {
	latestCard: true,
};

const settings = {
	card: {
		history: [] as Card[],
	},
	view: {
		type: ViewType.Cards,
		page: 1,
		maxPage: undefined as number | undefined,
		// Cards per page
		cpp: 15,
		class: undefined as Class | undefined,
	},
	sort: {
		type: "rarity" as keyof Card,
		order: SortOrder.Ascending,
	},
	search: {
		query: [] as string[],
		prevQuery: [] as string[],
	},
	deckcode: {
		cardId: CardIdOrName.Id,
		format: DeckcodeFormat.JS,
	},
	commands: {
		default: "add",
		history: [] as string[],
		undoableHistory: [] as string[],
	},
	other: {
		firstScreen: true,
	},
};

const defaultSettings = game.lodash.cloneDeep(settings);

/**
 * Asks the user which class to choose, and returns it.
 */
async function askClass(): Promise<Class> {
	while (true) {
		hub.watermark(false);

		const heroClassString = await game.input(
			`What class do you want to choose?\n${classes.join(", ")}\n`,
		);
		if (!heroClassString) {
			await game.pause("\n<red>Invalid class.</red>");
			continue;
		}

		let heroClass: Class | undefined;

		if (heroClassString) {
			const cl = classes.find(
				(c) =>
					c.toLowerCase() === heroClassString.replaceAll(" ", "").toLowerCase(),
			);
			if (!cl) {
				await game.pause("\n<red>Invalid class.</red>");
				continue;
			}

			heroClass = cl as Class;
		}

		if (!heroClass) {
			throw new TypeError(
				"heroClass is undefined even though cl was found. This should be impossible.",
			);
		}

		player.heroClass = heroClass;

		if (player.canUseRunes()) {
			runes = [];

			while (runes.length < 3) {
				hub.watermark(false);

				const runeChar = await game.inputTranslate(
					`What runes do you want to add (%s more)\n${Object.values(Rune).join(", ")}\n`,
					3 - runes.length,
				);
				if (!runeChar) {
					continue;
				}

				const rune = Object.values(Rune).find((r) =>
					r.startsWith(runeChar[0].toUpperCase()),
				);
				if (!rune) {
					continue;
				}

				runes.push(rune);
			}

			player.runes = runes;
		}

		return heroClass;
	}
}

/**
 * Sort the input cards based on the current `settings`.
 *
 * @returns The sorted cards
 */
function sortCards(_cards: Card[]): Card[] {
	// If the order is invalid, fall back to ascending
	if (
		![SortOrder.Ascending, SortOrder.Descending].includes(settings.sort.order)
	) {
		settings.sort.order = defaultSettings.sort.order;
	}

	const type = settings.sort.type;
	const order = settings.sort.order;

	const calcOrder = (a: string | number, b: string | number) => {
		if (typeof a !== typeof b) {
			throw new TypeError("A and B are different types.");
		}

		if (order === SortOrder.Ascending) {
			if (typeof a === "string") {
				return a.localeCompare(b as string);
			}

			return a - (b as number);
		}

		if (typeof a === "string") {
			return -a.localeCompare(b as string);
		}

		return (b as number) - a;
	};

	if (type === "rarity") {
		const sortScores = [
			Rarity.Free,
			Rarity.Common,
			Rarity.Rare,
			Rarity.Epic,
			Rarity.Legendary,
		];

		return _cards.sort((a, b) => {
			const scoreA = sortScores.indexOf(a.rarity);
			const scoreB = sortScores.indexOf(b.rarity);

			return calcOrder(scoreA, scoreB);
		});
	}

	if (["name", "type"].includes(type)) {
		return _cards.sort((a, b) => {
			let typeA: string;
			let typeB: string;

			if (type === "name") {
				typeA = a.name;
				typeB = b.name;
			} else {
				typeA = a.type;
				typeB = b.type;
			}

			let returnValue = typeA.localeCompare(typeB);
			if (order === SortOrder.Descending) {
				returnValue = -returnValue;
			}

			return returnValue;
		});
	}

	if (type === "cost" || type === "id") {
		const newType = type;

		return _cards.sort((a, b) => calcOrder(a[newType], b[newType]));
	}

	// If 'type' isn't valid, fall back to sorting by rarity
	settings.sort.type = defaultSettings.sort.type;
	return sortCards(_cards);
}

/**
 * Searches cards based on a query.
 *
 * # Examples:
 * ```ts
 * let searched = searchCards(cards, 'cost:1');
 * searched = searchCards(cards, 'cost:even');
 * searched = searchCards(cards, 'name:Hi rarity:Legendary');
 *```
 */
function searchCards(_cards: Card[], searchQuery: string): Card[] | false {
	if (searchQuery.length <= 0) {
		return _cards;
	}

	const returnValueCards: Card[] = [];

	const splitQuery = searchQuery.split(":");

	if (splitQuery.length <= 1) {
		// The user didn't specify a key. Do a general search
		const query = splitQuery[0].toLowerCase();

		for (const card of _cards) {
			const name = card.name.toLowerCase();
			const text = card.text.toLowerCase();

			if (!name.includes(query) && !text.includes(query)) {
				continue;
			}

			returnValueCards.push(card);
		}

		return returnValueCards;
	}

	let [key, value] = splitQuery;

	value = value.toLowerCase();

	const doReturn = (c: Card) => {
		const returnValue = c[key as keyof Card];

		// Javascript
		if (!returnValue && returnValue !== 0) {
			console.log("\n<red>Key '%s' not valid!</red>", key);
			return -1;
		}

		// Mana even / odd
		if (key === "cost") {
			if (typeof returnValue !== "number") {
				throw new TypeError("`ret` is not a number.");
			}

			if (value === "even") {
				return returnValue % 2 === 0;
			}

			if (value === "odd") {
				return returnValue % 2 === 1;
			}

			// Mana range (1-10)
			const regex = /\d+-\d+/;
			if (regex.test(value)) {
				const valueSplit = value.split("-");

				const min = game.lodash.parseInt(valueSplit[0]);
				const max = game.lodash.parseInt(valueSplit[1]);

				return returnValue >= min && returnValue <= max;
			}

			const parsedValue = game.lodash.parseInt(value);

			if (!Number.isNaN(parsedValue)) {
				return returnValue === parsedValue;
			}

			console.log("\n<red>Value '%s' not valid!</red>", value);
			return -1;
		}

		if (typeof returnValue === "string") {
			return returnValue.toLowerCase().includes(value);
		}

		if (typeof returnValue === "number") {
			return returnValue === Number.parseFloat(value);
		}

		return -1;
	};

	let error = false;

	for (const card of _cards) {
		if (error) {
			continue;
		}

		const returnValue = doReturn(card);

		if (returnValue === -1) {
			error = true;
			continue;
		}

		if (returnValue) {
			returnValueCards.push(card);
		}
	}

	if (error) {
		return false;
	}

	return returnValueCards;
}

/**
 * Shows the possible cards that the user can add to their deck.
 */
async function showCards(): Promise<void> {
	filteredCards = [];
	hub.watermark(false);

	// If the user chose to view an invalid class, reset the viewed class to default.
	const correctClass = game.functions.card.validateClasses(
		[settings.view.class ?? chosenClass],
		chosenClass,
	);

	if (!settings.view.class || !correctClass) {
		settings.view.class = chosenClass;
	}

	// Filter away cards that aren't in the chosen class
	for (const card of Object.values(cards)) {
		if (card.runes && !player.testRunes(card.runes)) {
			continue;
		}

		const correctClass = game.functions.card.validateClasses(
			card.classes,
			settings.view.class ?? chosenClass,
		);

		if (correctClass) {
			filteredCards.push(card);
		}
	}

	if (filteredCards.length <= 0) {
		console.log(
			"<yellow>No cards found for the selected classes '%s and Neutral'.</yellow>",
			chosenClass,
		);
	}

	const cardsPerPage = settings.view.cpp;
	let page = settings.view.page;

	// Search
	if (settings.search.query.length > 0) {
		console.log("Searching for '%s'.", settings.search.query.join(" "));
	}

	// Filter to show only cards in the viewed class
	let classCards = Object.values(filteredCards).filter((c) =>
		c.classes.includes(settings.view.class ?? chosenClass),
	);

	if (classCards.length <= 0) {
		console.log(
			"<yellow>No cards found for the viewed class '%s'.</yellow>",
			settings.view.class,
		);

		return;
	}

	let searchFailed = false;

	// Search functionality
	for (const query of settings.search.query) {
		if (searchFailed) {
			continue;
		}

		const searchedCards = searchCards(classCards, query);

		if (searchedCards === false) {
			await game.pause(
				`<red>Search failed at '${query}'! Reverting back to last successful query.\n</red>`,
			);

			searchFailed = true;
			continue;
		}

		classCards = searchedCards;
	}

	if (classCards.length <= 0) {
		await game.pause("<yellow>\nNo cards match search.\n</yellow>");
		searchFailed = true;
	}

	if (searchFailed) {
		settings.search.query = settings.search.prevQuery;
		await showCards();
		return;
	}

	settings.search.prevQuery = settings.search.query;

	settings.view.maxPage = Math.ceil(classCards.length / cardsPerPage);
	if (page > settings.view.maxPage) {
		page = settings.view.maxPage;
	}

	const oldSortType = settings.sort.type;
	const oldSortOrder = settings.sort.order;
	console.log(
		"Sorting by %s, %s.",
		settings.sort.type.toUpperCase(),
		settings.sort.order.toLowerCase(),
	);

	// Sort
	classCards = sortCards(classCards);

	const sortTypeInvalid = oldSortType !== settings.sort.type;
	const sortOrderInvalid = oldSortOrder !== settings.sort.order;

	if (sortTypeInvalid) {
		console.log(
			"<yellow>Sorting by </yellow>'%s'<yellow> failed! Falling back to </yellow>%s.",
			oldSortType.toUpperCase(),
			settings.sort.type.toUpperCase(),
		);
	}

	if (sortOrderInvalid) {
		console.log(
			"<yellow>Ordering by </yellow>'%sending'<yellow> failed! Falling back to </yellow>%s.",
			oldSortOrder,
			settings.sort.order.toLowerCase(),
		);
	}

	if (sortTypeInvalid || sortOrderInvalid) {
		console.log(
			"\nSorting by %s, %s.",
			settings.sort.type.toUpperCase(),
			settings.sort.order.toLowerCase(),
		);
	}

	// Page logic
	classCards = classCards.slice(cardsPerPage * (page - 1), cardsPerPage * page);

	// Loop
	console.log("\nPage %s / %s\n", page, settings.view.maxPage);

	console.log("<underline>%s</underline>", settings.view.class);

	const columns: string[] = [];
	for (const card of classCards) {
		// Can't separate using "-" since that would break, for example, "Yogg-Saron, ..."
		columns.push(`${card.colorFromRarity()} __HSJS_SEPERATOR__ ${card.id}`);
	}

	console.log(
		game.functions.util
			.alignColumns(columns, "__HSJS_SEPERATOR__")
			.join("\n")
			.replaceAll("__HSJS_SEPERATOR__", "-"),
	);

	console.log("\nCurrent deckcode output:");
	const deckcode = await generateDeckcode();

	if (!deckcode.error) {
		console.log("<bright:green>Valid deck!</bright:green>");
		console.log(deckcode.code);
	}

	if (settings.other.firstScreen) {
		console.log("\nType 'rules' to see a list of rules.");

		settings.other.firstScreen = false;
	}
}

/**
 * Prints the rules / config to the screen
 */
function showRules(): void {
	const configText = "### RULES ###";
	console.log("#".repeat(configText.length));
	console.log(configText);
	console.log("#".repeat(configText.length));

	console.log("#");

	console.log(
		"# Validation: %s",
		game.translate(
			config.decks.validate
				? "<bright:green>ON</bright:green>"
				: "<red>OFF</red>",
		),
	);

	console.log(
		"#\n# Rule 1. Minimum Deck Length: <yellow>%s</yellow>",
		config.decks.minLength,
	);

	console.log(
		"# Rule 2. Maximum Deck Length: <yellow>%s</yellow>",
		config.decks.maxLength,
	);

	console.log(
		"#\n# Rule 3. Maximum amount of cards for each card (eg. You can only have: <yellow>x</yellow> Seances in a deck): <yellow>%s</yellow>",
		config.decks.maxOfOneCard,
	);

	console.log(
		"# Rule 4. Maximum amount of cards for each legendary card (Same as Rule 3 but for legendaries): <yellow>%s</yellow>",
		config.decks.maxOfOneLegendary,
	);

	console.log("#");

	console.log(
		"# There are 3 types of deck states: Valid, Pseudo-Valid, Invalid",
	);

	console.log("# Valid decks will work properly");
	console.log(
		"# Pseudo-valid decks will be rejected by the deck importer for violating a rule",
	);

	console.log(
		"# Invalid decks are decks with a fundemental problem that the deck importer cannot resolve. Eg. An invalid card in the deck.",
	);

	console.log(
		"# Violating any of these rules while validation is enabled will result in a pseudo-valid deck.",
	);

	console.log("#");

	console.log("#".repeat(configText.length));
}

/**
 * Find a card from a name / id.
 *
 * @param cardName The name / id of the card
 */
function findCard(cardName: string): Card | undefined {
	let returnCard: Card | undefined;

	for (const card of Object.values(filteredCards)) {
		if (
			card.id.startsWith(cardName) ||
			(typeof cardName === "string" &&
				card.name.toLowerCase().startsWith(cardName.toLowerCase()))
		) {
			returnCard = card;
		}
	}

	return returnCard;
}

/**
 * Adds a card to the deck
 */
function add(card: Card): boolean {
	deck.push(card);

	if (!card.deckSettings) {
		return true;
	}

	for (const setting of Object.entries(card.deckSettings)) {
		const [key, value] = setting;
		config[key as keyof GameConfig] = value as any;
	}

	return true;
}

/**
 * Removes a card from the deck
 */
function remove(card: Card): boolean {
	return game.functions.util.remove(deck, card);
}

/**
 * Shows the cards that are in the users deck. This is a replacement for `showCards`.
 */
async function showDeck(): Promise<void> {
	hub.watermark(false);

	console.log("Deck Size: <yellow>%s</yellow>\n", deck.length);

	const cards = deck.reduce<Record<string, [Card, number]>>((acc, card) => {
		acc[card.id] = [card, (acc[card.id]?.[1] ?? 0) + 1];
		return acc;
	}, {});

	const columns: string[] = [];

	for (const cardObject of Object.values(cards)) {
		const card = cardObject[0];
		const amount = cardObject[1];

		const column = `${amount > 1 ? `x${amount} ` : ""}${card.colorFromRarity()} __HSJS_SEPERATOR__ ${card.id}`;
		columns.push(column);
	}

	console.log(
		game.functions.util
			// Can't separate using "-" since that would break, for example, "Yogg-Saron, ..."
			.alignColumns(columns, "__HSJS_SEPERATOR__")
			.join("\n")
			.replaceAll("__HSJS_SEPERATOR__", "-"),
	);

	console.log("\nCurrent deckcode output:");
	const deckcode = await generateDeckcode();

	if (!deckcode.error) {
		console.log("<bright:green>Valid deck!</bright:green>");
		console.log(deckcode.code);
	}
}

/**
 * Generates a deckcode from the current deck.
 *
 * @param parseVanillaOnPseudo Converts the deckcode to a vanilla one even if the deck is pseudo-valid. This will decrease performance.
 */
async function generateDeckcode(parseVanillaOnPseudo = false) {
	const deckcode = game.functions.deckcode.export(deck, chosenClass, runes);
	const error = deckcode.error;

	if (error) {
		let log = "<yellow>WARNING: ";
		switch (error.msg) {
			case "TooFewCards": {
				log += "Too few cards.";
				break;
			}

			case "TooManyCards": {
				log += "Too many cards.";
				break;
			}

			case "EmptyDeck": {
				log =
					"<red>ERROR: Could not generate deckcode as your deck is empty. The resulting deckcode would be invalid.</red>";

				break;
			}

			case "TooManyCopies": {
				log += util.format(
					"Too many copies of a card. Maximum: </yellow>'%s'<yellow>. Offender: </yellow>'%s'<yellow>",
					config.decks.maxOfOneCard,
					`{ Id: "${error.info?.card?.id}", Copies: "${error.info?.amount}" }`,
				);

				break;
			}

			case "TooManyLegendaryCopies": {
				log += util.format(
					"Too many copies of a Legendary card. Maximum: </yellow>'%s'<yellow>. Offender: </yellow>'%s'<yellow>",
					config.decks.maxOfOneLegendary,
					`{ Id: "${error.info?.card?.id}", Copies: "${error.info?.amount}" }`,
				);

				break;
			}

			default: {
				throw new Error("invalid error message found");
			}
		}

		console.log(log);
	}

	if (
		settings.deckcode.format === DeckcodeFormat.Vanilla &&
		(parseVanillaOnPseudo || !deckcode.error)
	) {
		// Don't convert if the error is unrecoverable
		if (deckcode.error && !deckcode.error.recoverable) {
			return deckcode;
		}

		deckcode.code = await game.functions.deckcode.toVanilla(
			player,
			deckcode.code,
		);
	}

	return deckcode;
}

/**
 * Show the help message. To be used by the "help" command.
 */
async function help(): Promise<void> {
	hub.watermark(false);

	// Commands
	console.log("<b>Available commands:</b>");
	console.log(
		"(In order to run a command; input the name of the command and follow further instruction.)\n",
	);

	const columns = [
		"(name) (required) [optional] - (description)\n",

		"add (name | id) - Add a card to the deck.",
		"remove (card | id) - Remove a card from the deck.",
		"view (card | id) - View a card.",
		"page (num) - Switch to a different page.",
		"cards (class) - Show cards from 'class'.",
		"sort (type) [order] - Sort by 'type' in 'order'ending order. (Type can be: ('rarity', 'name', 'cost', 'id', 'type'), Order can be: ('asc', 'desc')) (Example: sort cost asc - Will show cards ordered by cost cost, ascending)",
		"search [query] - Search by query. Keys: ('name', 'text', 'cost', 'rarity', 'id'), Examples: (search the - Search for all cards with the word 'the' in the name or description, case insensitive.), (search cost:2 - Search for all cards that costs 2 cost, search cost:even name:r - Search for all even cost cards with 'r' in its name)",
		"undo - Undo the last action.",
		"deck - Toggle deck-view.",
		"deckcode - View the current deckcode.",
		"import (deckcode) - Import a deckcode. (Overrides your deck)",
		"set (setting) (value) - Change a setting. Look down to 'Set Subcommands' to see available settings.",
		"warning (name) [off | on] - Change a warning. Look down to 'Warnings' to see available warnings.",
		"class - Change the class.",
		"eval - Run some code. Be careful with copying code from the internet since it could be malicious.",
		"config | rules - Show the rules for valid decks and invalid decks.",
		"help - Show this message.",
		"exit - Quits the program.",
	];

	const alignedColumns = game.functions.util.alignColumns(columns, "-");
	for (const alignedColumn of alignedColumns) {
		console.log(alignedColumn);
	}

	// Set
	console.log("\n<b>Set Subcommands:</b>");
	console.log(
		"(In order to use these; input 'set ', then one of the subcommands. Example: 'set cpp 20')\n",
	);

	const setSubcommandColumns = [
		"(name) (required) [optional] - (description)\n",

		"format (format) - Output the deckcode in a different format ('js', 'vanilla') [default = 'js']",
		"cardsPerPage | cpp (num) - How many cards to show per page [default = 15]",
		"defaultCommand | dcmd (cmd) - The command that should run when the command is unspecified ('add', 'remove', 'view') [default = 'add']",
	];

	const setSubcommandAlignedColumns = game.functions.util.alignColumns(
		setSubcommandColumns,
		"-",
	);

	for (const alignedColumns of setSubcommandAlignedColumns) {
		console.log(alignedColumns);
	}

	console.log(
		"<gray>NOTE: the 'cardsPerPage' setting has 2 different names; cpp & cardsPerPage. You can use either.</gray>",
	);

	// Warning
	console.log("\n<b>Warnings:</b>");
	console.log(
		"(In order to use these; input 'warning (name) [off | on]'. Example: 'warning latestCard off')\n",
	);

	const warningColumns = [
		"(name) - (description)\n",

		"latestCard - Warning that shows up when attemping to use the latest card. The latest card is used if the card chosen in a command is invalid and the name specified begins with 'l'. Example: 'add latest' - Adds a copy of the latest card to the deck.",
	];

	const warningAlignedColumns = game.functions.util.alignColumns(
		warningColumns,
		"-",
	);
	for (const alignedColumns of warningAlignedColumns) {
		console.log(alignedColumns);
	}

	console.log(
		`<gray>NOTE: If you don't specify a state (off / on) it will toggle the state of the warning.
NOTE: The word 'off' can be exchanged with 'disable', 'false', or '0'.
NOTE: The word 'on' can be exchanged with 'enable', 'true', or '1'.</gray>`,
	);

	// Notes
	// TODO: #245 Fix the known bug.
	console.log(`\n<gray>NOTE: Type 'cards Neutral' to see Neutral cards.
BUG: There is a known bug where if you add 'Prince Renathal', and then remove him, the deck will still require 40 cards. The only way around this is to restart the deck creator.
`);

	await game.pause("\nPress enter to continue...\n");
}

/**
 * Gets a card from arguments
 *
 * @param args Arguments for the command
 * @param callback Callback to run
 * @param errorCallback If the `callback` returns false, run this function.
 *
 * @returns Success
 */
async function getCardArg(
	args: string[],
	callback: (card: Card) => Promise<boolean>,
	errorCallback: () => void,
): Promise<boolean> {
	let times = 1;

	const cardFromFullString = findCard(args.join(" "));

	// Get x2 from the cmd
	if (args.length > 1 && game.lodash.parseInt(args[0]) && !cardFromFullString) {
		times = game.lodash.parseInt(args[0], 10);
		args.shift();
	}

	const cmd = args.join(" ");

	let eligibleForLatest = false;
	if (cmd.startsWith("l")) {
		eligibleForLatest = true;
	}

	let card = findCard(cmd);

	if (!card && eligibleForLatest) {
		if (warnings.latestCard) {
			await game.pause(
				"<yellow>Card not found. Using latest valid card instead.</yellow>",
			);
		}

		card = game.lodash.last(settings.card.history);
	}

	if (!card) {
		await game.pause("<red>Invalid card.</red>\n");
		return false;
	}

	for (let i = 0; i < times; i++) {
		if (!(await callback(card))) {
			errorCallback();
		}
	}

	settings.card.history.push(card);
	return true;
}

/**
 * Runs the correct command based on the input.
 *
 * @param cmd The user input
 * @param addToHistory If it should add the command to the history
 *
 * @returns Success
 */
async function handleCmds(cmd: string, addToHistory = true): Promise<boolean> {
	if (findCard(cmd)) {
		// You just typed the name of a card.
		return handleCmds(`${settings.commands.default} ${cmd}`);
	}

	const args = cmd.split(" ");
	const name = args.shift()?.toLowerCase();
	if (!name) {
		await game.pause("<red>Invalid command.</red>\n");
		return false;
	}

	let foundCommand = false;

	if (game.functions.interact.isInputExit(name)) {
		running = false;
		return true;
	}

	const commandName = Object.keys(commands).find(
		(commandName) => commandName === name,
	);

	if (commandName) {
		foundCommand = true;
		await commands[commandName](args);
	}

	if (!foundCommand) {
		// Infer add
		const tryCommand = `${settings.commands.default} ${cmd}`;
		console.log(
			"<yellow>Unable to find command. Trying '%s'</yellow>",
			tryCommand,
		);

		return handleCmds(tryCommand);
	}

	if (!addToHistory) {
		return true;
	}

	settings.commands.history.push(cmd);
	if (["a", "r"].includes(cmd[0])) {
		settings.commands.undoableHistory.push(cmd);
	}

	return true;
}

let running = true;

/**
 * Runs the deck creator.
 */
export async function main(): Promise<void> {
	running = true;
	chosenClass = await askClass();

	while (running) {
		if (settings.view.type === ViewType.Cards) {
			await showCards();
		} else if (settings.view.type === ViewType.Deck) {
			await showDeck();
		}

		await handleCmds(await game.input("\n> "));
	}
}

const commands: CommandList = {
	async add(args): Promise<boolean> {
		let success = true;

		await getCardArg(
			args,
			async (card) => add(card),
			async () => {
				// Internal error since add shouldn't return false
				console.log(
					"<red>Internal Error: Something went wrong while adding a card. Please report this. Error code: DcAddInternal</red>",
				);

				await game.pause();

				success = false;
			},
		);

		if (!success) {
			return false;
		}

		return true;
	},
	async remove(args): Promise<boolean> {
		let success = true;

		await getCardArg(
			args,
			async (card) => remove(card),
			async () => {
				// User error
				console.log("<red>Invalid card.</red>");
				await game.pause();

				success = false;
			},
		);

		if (!success) {
			return false;
		}

		return true;
	},
	async page(args): Promise<boolean> {
		let page = game.lodash.parseInt(args.join(" "));
		if (!page) {
			return false;
		}

		if (page < 1) {
			page = 1;
		}

		settings.view.page = page;

		return true;
	},
	async config(): Promise<boolean> {
		hub.watermark(false);
		showRules();
		await game.pause("\nPress enter to continue...\n");

		return true;
	},
	async rules(args, flags): Promise<boolean> {
		return (await commands.config(args, flags)) as boolean;
	},
	async view(args): Promise<boolean> {
		// The callback function doesn't return anything, so we don't do anything with the return value of `getCardArg`.
		await getCardArg(
			args,
			async (card) => {
				console.log(`${await card.readable()}\n`);
				await game.pause();
				return true;
			},
			() => {
				// Pass
			},
		);

		return true;
	},
	async cards(args): Promise<boolean> {
		if (args.length <= 0) {
			return false;
		}

		const heroClass = game.lodash.startCase(args.join(" ")) as Class;

		if (!classes.includes(heroClass) && heroClass !== Class.Neutral) {
			await game.pause("<red>Invalid class!</red>\n");
			return false;
		}

		const correctClass = game.functions.card.validateClasses(
			[heroClass],
			chosenClass,
		);

		if (!correctClass) {
			await game.pause(
				`<yellow>Class '${heroClass}' is a different class. To see these cards, please switch class from '${chosenClass}' to '${heroClass}' to avoid confusion.</yellow>\n`,
			);

			return false;
		}

		settings.view.class = heroClass;

		return true;
	},
	async deckcode(): Promise<boolean> {
		const deckcode = await generateDeckcode(true);

		let toPrint = `${deckcode.code}\n`;
		if (deckcode.error && !deckcode.error.recoverable) {
			toPrint = "";
		}

		await game.pause(toPrint);

		return true;
	},
	async sort(args): Promise<boolean> {
		if (args.length <= 0) {
			return false;
		}

		settings.sort.type = args[0] as keyof Card;
		if (args.length > 1) {
			if (args[1] === "asc") {
				settings.sort.order = SortOrder.Ascending;
			} else if (args[1] === "desc") {
				settings.sort.order = SortOrder.Descending;
			}
		}

		return true;
	},
	async search(args): Promise<boolean> {
		if (args.length <= 0) {
			settings.search.query = [];
			return false;
		}

		settings.search.query = args;

		return true;
	},
	async deck(): Promise<boolean> {
		settings.view.type =
			settings.view.type === ViewType.Cards ? ViewType.Deck : ViewType.Cards;

		return true;
	},
	async import(args): Promise<boolean> {
		const deckcode = args.join(" ");

		config.decks.validate = false;
		let newDeck = await game.functions.deckcode.import(player, deckcode);
		config.decks.validate = true;

		if (!newDeck) {
			return false;
		}

		newDeck = newDeck.sort((a, b) => a.name.localeCompare(b.name));

		deck = [];

		// Update the filtered cards
		chosenClass = player.heroClass;
		runes = player.runes;
		await showCards();

		/*
		 * Add the cards using handleCmds instead of add because for some reason, adding them with add
		 * causes a weird bug that makes modifying the deck impossible because removing a card
		 * removes a completly unrelated card because javascript.
		 * You can just set deck = functions.importDeck(), but doing it that way doesn't account for renathal or any other card that changes the config in any way since that is done using the add function.
		 */
		for (const card of newDeck) {
			await handleCmds(`add ${card.id}`);
		}

		return true;
	},
	async class(): Promise<boolean> {
		const oldRunes = game.lodash.clone(runes);
		const newClass = await askClass();

		if (newClass === chosenClass && runes === oldRunes) {
			await game.pause("<yellow>Your class was not changed</yellow>\n");
			return false;
		}

		deck = [];
		chosenClass = newClass;
		if (settings.view.class !== Class.Neutral) {
			settings.view.class = chosenClass;
		}

		return true;
	},
	async undo(): Promise<boolean> {
		if (settings.commands.undoableHistory.length <= 0) {
			await game.pause("<red>Nothing to undo.</red>\n");
			return false;
		}

		const commandSplit = game.lodash
			.last(settings.commands.undoableHistory)
			?.split(" ");

		if (!commandSplit) {
			await game.pause(
				"<red>Could not find anything to undo. This is a bug.</red>\n",
			);

			return false;
		}

		const args = commandSplit.slice(1);
		const command = commandSplit[0];

		let reverse: string;

		if (command.startsWith("a")) {
			reverse = "remove";
		} else if (command.startsWith("r")) {
			reverse = "add";
		} else {
			// This shouldn't ever happen, but oh well
			console.log("<red>Command '%s' cannot be undoed.</red>", command);
			return false;
		}

		await handleCmds(`${reverse} ${args.join(" ")}`, false);

		settings.commands.undoableHistory.pop();
		settings.commands.history.pop();

		return true;
	},
	async help(): Promise<boolean> {
		await help();

		return true;
	},
	async warning(args): Promise<boolean> {
		const key = args[0] as keyof typeof warnings;

		if (!Object.keys(warnings).includes(key)) {
			await game.pause(`<red>'${key}' is not a valid warning!</red>\n`);
			return false;
		}

		let newState: boolean;

		if (args.length <= 1) {
			// Toggle
			newState = !warnings[key];
		} else {
			const value = args[1];

			if (["off", "disable", "false", "no", "0"].includes(value)) {
				newState = false;
			} else if (["on", "enable", "true", "yes", "1"].includes(value)) {
				newState = true;
			} else {
				await game.pause(
					`<red>${value} is not a valid state. View 'help' for more information.</red>\n`,
				);

				return false;
			}
		}

		if (warnings[key] === newState) {
			const newStateName = newState ? "enabled" : "disabled";

			await game.pause(
				`<yellow>Warning '<bright:yellow>${key}</bright:yellow>' is already ${newStateName}.</yellow>\n`,
			);

			return false;
		}

		warnings[key] = newState;

		const newStateName = newState
			? "<bright:green>Enabled warning</bright:green>"
			: "<red>Disabled warning</red>";
		await game.pause(`${newStateName} <yellow>'${key}'</yellow>\n`);

		return true;
	},
	async set(args): Promise<boolean> {
		if (args.length <= 0) {
			console.log("<yellow>Too few arguments</yellow>");
			await game.pause();
			return false;
		}

		const setting = args.shift();

		switch (setting) {
			case "format": {
				if (args.length === 0) {
					settings.deckcode.format = defaultSettings.deckcode.format;
					console.log(
						"Reset deckcode format to: <yellow>%s</yellow>",
						defaultSettings.deckcode.format,
					);

					break;
				}

				if (args[0] === "js") {
					settings.deckcode.format = DeckcodeFormat.JS;
				} else if (args[0] === "vanilla") {
					settings.deckcode.format = DeckcodeFormat.Vanilla;
				} else {
					console.log("<red>Invalid format!</red>");
					await game.pause();
					return false;
				}

				console.log("Set deckcode format to: <yellow>%s</yellow>", args[0]);
				break;
			}

			case "cpp":
			case "cardsPerPage": {
				if (args.length === 0) {
					settings.view.cpp = defaultSettings.view.cpp;
					console.log(
						"Reset cards per page to: <yellow>%s</yellow>",
						defaultSettings.view.cpp,
					);

					break;
				}

				settings.view.cpp = game.lodash.parseInt(args[0]);
				break;
			}

			case "dcmd":
			case "defaultCommand": {
				if (args.length === 0) {
					settings.commands.default = defaultSettings.commands.default;
					console.log(
						"Set default command to: <yellow>%s</yellow>",
						defaultSettings.commands.default,
					);

					break;
				}

				if (!["add", "remove", "view"].includes(args[0])) {
					return false;
				}

				const command = args[0];

				settings.commands.default = command;
				console.log("Set default command to: <yellow>%s</yellow>", command);
				break;
			}

			default: {
				await game.pause(`<red>'${setting}' is not a valid setting.</red>\n`);
				return false;
			}
		}

		await game.pause(
			"<bright:green>Setting successfully changed!<bright:green>\n",
		);

		return true;
	},
	async eval(args): Promise<boolean> {
		if (args.length <= 0) {
			await game.pause("<red>Too few arguments.</red>\n");
			return false;
		}

		const code = await game.functions.util.parseEvalArgs(args);

		try {
			// biome-ignore lint/security/noGlobalEval: This is a security issue yes, but it's a debug command.
			await eval(code);
		} catch (error) {
			if (!(error instanceof Error)) {
				throw new TypeError("`error` is not an instance of Error");
			}

			console.log(
				"\n<red>An error happened while running this code! Here is the error:</red>",
			);

			// The stack includes "<anonymous>", which would be parsed as a tag, which would cause another error
			stopTagParsing();
			console.log(error.stack);
			resumeTagParsing();

			await game.pause();
		}

		await game.event.broadcast(Event.Eval, code, game.player);
		return true;
	},
};
