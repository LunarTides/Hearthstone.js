import { Card } from "@Game/card.ts";
import {
	Class,
	type CommandList,
	Event,
	type GameConfig,
	Rune,
} from "@Game/types.ts";
import util from "node:util";
import { input, Separator, search } from "@inquirer/prompts";
import { parseTags, resumeTagParsing, stopTagParsing } from "chalk-tags";
import * as hub from "../hub.ts";

enum DeckcodeFormat {
	Vanilla = "Vanilla",
	JS = "JS",
}

const config = game.config;
const player = game.player;
const classes = await game.functions.card.getClasses();
const cards = await Card.all(game.config.advanced.dcShowUncollectible);

let chosenClass: Class;
let viewingClass: Class;

let deck: Card[] = [];
let runes: Rune[] = [];

const settings = {
	deckcode: {
		format: DeckcodeFormat.JS,
	},
	commands: {
		history: [] as string[],
		undoableHistory: [] as string[],
	},
};

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
 * Runs the correct command based on the input.
 *
 * @param cmd The user input
 * @param addToHistory If it should add the command to the history
 *
 * @returns Success
 */
async function handleCmds(cmd: string, addToHistory = true): Promise<boolean> {
	const args = cmd.split(" ");
	const name = args.shift()?.toLowerCase();
	if (!name) {
		await game.pause("<red>Invalid command.</red>\n");
		return false;
	}

	if (game.functions.interact.isInputExit(name)) {
		return true;
	}

	const commandName = Object.keys(commands).find(
		(commandName) => commandName === name,
	);

	if (commandName) {
		await commands[commandName](args);
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

/**
 * Runs the deck creator.
 */
export async function main(): Promise<void> {
	chosenClass = await askClass();
	viewingClass = chosenClass;

	let cardsToShow = cards;
	let showingDeck = false;

	const filterCards = (c: Card) => {
		// TODO: Add runes.
		return c.classes.includes(viewingClass);
	};

	while (true) {
		hub.watermark(false);
		const deckcode = await generateDeckcode();

		if (!deckcode.error) {
			console.log("<bright:green>Valid deck!</bright:green>");
			console.log(deckcode.code);
		}

		console.log(`Cards: ${cardsToShow.filter(filterCards).length}`);
		console.log();

		const id = await search({
			message: "",
			source: async (value) => [
				{
					value: "Deck",
				},
				{
					value: "Commands",
				},
				new Separator(),
				...(await Promise.all(
					cardsToShow
						.filter(
							// TODO: Add runes.
							(c) =>
								(!value ||
									c.name.toLowerCase().includes(value.toLowerCase()) ||
									c.id.includes(value)) &&
								filterCards(c),
						)
						.sort((a, b) => a.name.localeCompare(b.name))
						.map(async (c) => ({
							name: parseTags(
								`${await c.readable()} {#<#${c.id.slice(0, 6)}>${c.id.slice(0, 8)}</#>}`,
							),
							value: c.id,
						})),
				)),
			],
			pageSize: 15,
		});

		if (id === "Deck") {
			showingDeck = !showingDeck;
			cardsToShow = showingDeck ? deck : cards;
			continue;
		} else if (id === "Commands") {
			// TODO: Do.
			let commands = [
				"Neutral - Switch between showing Neutral cards.",
				"Undo - Undo the last action.",
				"Deckcode - View the current deckcode.",
				"Import (deckcode) - Import a deckcode. (Overrides your deck)",
				"Class - Change the class.",
				"Format - Output the deckcode in a different format. Switches between the Hearthstone.js format and the Vanilla format.",
				"Eval (code) - Run some code. Be careful with copying code from the internet since it could be malicious.",
				"Rules - Show the rules for valid decks and invalid decks.",
				"Exit - Quits the program.",
			];

			commands = game.functions.util.alignColumns(commands, "-");

			let command = await game.prompt.customSelect(
				"Which command do you want to run?",
				commands,
			);
			if (command === "Back") {
				continue;
			}

			command = commands[parseInt(command, 10)].split(" ")[0].toLowerCase();

			if (["import", "eval"].includes(command.toLowerCase())) {
				const args = await input({
					message: command.toLowerCase(),
				});

				command = `${command} ${args}`;
			}

			await handleCmds(command);
			continue;
		}

		const card = cards.find((c) => c.id === id)!;

		if (showingDeck) {
			remove(card);
		} else {
			add(card);
		}
	}
}

const commands: CommandList = {
	async neutral(): Promise<boolean> {
		viewingClass = viewingClass === Class.Neutral ? chosenClass : Class.Neutral;
		return true;
	},
	async rules(): Promise<boolean> {
		hub.watermark(false);
		showRules();
		await game.pause("\nPress enter to continue...\n");

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
		if (viewingClass !== Class.Neutral) {
			viewingClass = chosenClass;
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
