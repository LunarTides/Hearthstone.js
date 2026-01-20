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

const player = game.player;
const cards = await Card.all(game.config.advanced.dcShowUncollectible);

let viewingClass: Class;

let cardsToShow = cards;
let showingDeck = false;

let deck: Card[] = [];

let deckcodeFormat: DeckcodeFormat = DeckcodeFormat.JS;
const undoableCommandHistory: string[] = [];

/**
 * Asks the user which class to choose, and returns it.
 */
async function askClass(): Promise<Class | undefined> {
	hub.watermark(false);

	const chosen = await game.prompt.customSelectEnum<Class>(
		`What class do you want to choose?`,
		Object.values(Class).filter((c) => c !== Class.Neutral),
	);
	if (chosen === ("Back" as Class)) {
		return undefined;
	}

	player.heroClass = chosen;
	if (player.canUseRunes()) {
		await game.prompt.configureArrayEnum(
			player.runes,
			Rune,
			{
				maxSize: 3,
				allowDuplicates: true,
			},
			async () => {
				hub.watermark(false);
				console.log("<blue>Add runes.</blue>\n");
			},
		);
	}

	return player.heroClass;
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
		game.config[key as keyof GameConfig] = value as any;
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
	const deckcode = game.functions.deckcode.export(
		deck,
		player.heroClass,
		player.runes,
	);
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
					"Too many copies of a card. Maximum: </yellow>'%s'<yellow>. Offender: </yellow>'%s'</yellow>",
					game.config.decks.maxOfOneCard,
					`{ Id: "${error.info?.card?.id}", Copies: "${error.info?.amount}" }`,
				);

				break;
			}

			case "TooManyLegendaryCopies": {
				log += util.format(
					"Too many copies of a Legendary card. Maximum: </yellow>'%s'<yellow>. Offender: </yellow>'%s'</yellow>",
					game.config.decks.maxOfOneLegendary,
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
		deckcodeFormat === DeckcodeFormat.Vanilla &&
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
	const name = args.shift()!.toLowerCase();

	await commands[name](args);

	if (!addToHistory) {
		return true;
	}

	if (["a", "r"].includes(cmd[0])) {
		undoableCommandHistory.push(cmd);
	}

	return true;
}

/**
 * Runs the deck creator.
 */
export async function main(): Promise<void> {
	{
		const heroClass = await askClass();
		if (!heroClass) {
			return;
		}
	}
	viewingClass = player.heroClass;

	cardsToShow = cards;
	showingDeck = false;

	const filterCards = (c: Card) => {
		// TODO: Add runes.
		return showingDeck || c.classes.includes(viewingClass);
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
								`${await c.readable()} {#<#${c.id.split("-").at(-1)!.slice(0, 6)}>${c.id.split("-").at(-1)!.slice(0, 6)}</#>}`,
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
				"Import (deckcode) - Import a deckcode. (Overrides your deck.)",
				"Class - Change the class. (Resets your deck.)",
				"Format - Output the deckcode in a different format. Switches between the Hearthstone.js format and the Vanilla format.",
				"Eval (code) - Run some code. Be careful with copying code from the internet since it could be malicious.",
				"Rules - Show the rules for valid decks and invalid decks.",
				"Exit - Quit the deck creator.",
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
			if (command === "exit") {
				break;
			}

			if (["import", "eval"].includes(command)) {
				const args = await input({
					message: command,
				});

				command = `${command} ${args}`;
			}

			await handleCmds(command);
			continue;
		}

		const card = cards.find((c) => c.id === id)!;

		if (showingDeck) {
			remove(card);
			undoableCommandHistory.push(`remove ${card.id}`);
		} else {
			add(card);
			undoableCommandHistory.push(`add ${card.id}`);
		}
	}
}

const commands: CommandList = {
	async neutral(): Promise<boolean> {
		viewingClass =
			viewingClass === Class.Neutral ? player.heroClass : Class.Neutral;
		return true;
	},
	async undo(): Promise<boolean> {
		if (undoableCommandHistory.length <= 0) {
			await game.pause("<red>Nothing to undo.</red>\n");
			return false;
		}

		const commandSplit = game.lodash.last(undoableCommandHistory)?.split(" ");
		if (!commandSplit) {
			await game.pause(
				"<red>Could not find anything to undo. This is a bug.</red>\n",
			);

			return false;
		}

		const args = commandSplit.slice(1);
		const command = commandSplit[0];

		if (command.startsWith("a")) {
			remove(cards.find((c) => c.id === args[0])!);
		} else if (command.startsWith("r")) {
			add(cards.find((c) => c.id === args[0])!);
		} else {
			// This shouldn't ever happen, but oh well
			console.log("<red>Command '%s' cannot be undoed.</red>", command);
			return false;
		}

		undoableCommandHistory.pop();
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

		game.config.decks.validate = false;
		let newDeck: Card[] | undefined;
		try {
			newDeck = await game.functions.deckcode.import(player, deckcode);
		} finally {
			game.config.decks.validate = true;
		}

		if (!newDeck) {
			return false;
		}

		newDeck = newDeck.sort((a, b) => a.name.localeCompare(b.name));
		deck = [];

		for (const card of newDeck) {
			add(card);
		}

		return true;
	},
	async class(): Promise<boolean> {
		const oldClass = game.lodash.clone(player.heroClass);
		const oldRunes = game.lodash.clone(player.runes);

		const newClass = await askClass();
		if (!newClass) {
			return false;
		}

		if (
			player.heroClass === oldClass &&
			game.lodash.isEqual(player.runes, oldRunes)
		) {
			return false;
		}

		deck = [];
		if (viewingClass !== Class.Neutral) {
			viewingClass = player.heroClass;
		}

		return true;
	},
	async format(): Promise<boolean> {
		deckcodeFormat =
			deckcodeFormat === DeckcodeFormat.JS
				? DeckcodeFormat.Vanilla
				: DeckcodeFormat.JS;
		return true;
	},
	async eval(args): Promise<boolean> {
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
	async rules(): Promise<boolean> {
		hub.watermark(false);

		console.log("--- Rules ---");
		console.log();

		console.log(
			"Validation: %s",
			game.translate(
				game.config.decks.validate
					? "<bright:green>ON</bright:green>"
					: "<red>OFF</red>",
			),
		);

		console.log(
			"\nMinimum Deck Length: <yellow>%s</yellow>",
			game.config.decks.minLength,
		);
		console.log(
			"Maximum Deck Length: <yellow>%s</yellow>",
			game.config.decks.maxLength,
		);

		console.log(
			"\nYou can only have: <yellow>%s</yellow> Sheep in a deck.",
			game.config.decks.maxOfOneCard,
		);
		console.log(
			"You can only have: <yellow>%s Brann Bronzebeard</yellow>",
			game.config.decks.maxOfOneLegendary,
		);

		console.log();
		await game.pause("Press enter to continue...\n");
		return true;
	},
};
