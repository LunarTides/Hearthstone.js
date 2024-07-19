/**
 * The entry point of the program. Acts like a hub between the tools / scripts and the game.
 * @module Hub
 */
import { Card } from "@Game/internal.js";

import * as src from "./src/index.js"; // Source Code
import * as clc from "./tools/cardcreator/class.js"; // Class Creator
import * as ccc from "./tools/cardcreator/custom.js"; // Custom Card Creator
import * as vcc from "./tools/cardcreator/vanilla.js"; // Vanilla Card Creator
import * as cli from "./tools/cli.js"; // Command Line Interface
import * as dc from "./tools/deckcreator.js"; // Deck Creator

logger.debug("Starting Hub...");

// These are here so we don't have to recalculate them every watermark call.
const version = game.functions.info.versionString(4);
const customCardsAmount = Card.all(true).length;
const collectibleCardsAmount = Card.all(false).length;
let vanillaCardsAmount = Number.NaN;
let collectibleVanillaCardsAmount = Number.NaN;

try {
	// `vanilla.getAll` will throw an error if the `vanillacards.json` file is missing.
	const vanillaCards = game.functions.card.vanilla.getAll();
	vanillaCardsAmount = vanillaCards.length;
	collectibleVanillaCardsAmount = vanillaCards.filter(
		(card) => card.collectible,
	).length;
} catch {}

/**
 * Clears the console and prints the version information of the Hearthstone.js Hub.
 */
const watermark = () => {
	game.interact.cls();

	console.log(
		`
 /$$   /$$  /$$$$$$        /$$$$$  /$$$$$$ 
| $$  | $$ /$$__  $$      |__  $$ /$$__  $$
| $$  | $$| $$  \\__/         | $$| $$  \\__/
| $$$$$$$$|  $$$$$$          | $$|  $$$$$$ 
| $$__  $$ \\____  $$    /$$  | $$ \\____  $$
| $$  | $$ /$$  \\ $$   | $$  | $$ /$$  \\ $$
| $$  | $$|  $$$$$$//$$|  $$$$$$/|  $$$$$$/
|__/  |__/ \\______/|__/ \\______/  \\______/ 
    `.replace("\n", ""),
	); // Remove the first newline in order to improve formatting in source code.

	console.log("Version: %s", version);

	console.log(
		"Custom Cards: <yellow>%s</yellow> (<green>%s</green> Collectible)",
		customCardsAmount,
		collectibleCardsAmount,
	);

	console.log(
		"Vanilla Cards: <blue>%s</blue> (<cyan>%s</cyan> Collectible)",
		vanillaCardsAmount,
		collectibleVanillaCardsAmount,
	);

	console.log();
};

/**
 * Simulates a user input loop.
 *
 * @param prompt The prompt to ask
 * @param exitCharacter If the input's first character is this, exit the loop
 * @param callback The callback to call for each input
 */
function userInputLoop(
	prompt: string,
	exitCharacter: string | undefined,
	callback: (input: string) => void,
) {
	let running = true;
	while (running) {
		watermark();

		const user = game.input(prompt);
		if (!user) {
			continue;
		}

		if (
			game.interact.shouldExit(user) ||
			user[0].toLowerCase() === exitCharacter?.toLowerCase()
		) {
			running = false;
			break;
		}

		callback(user);
	}
}

/**
 * Asks the user which card creator variant they want to use.
 */
function cardCreator() {
	userInputLoop(
		"<green>Create a (C)ustom Card</green>, <blue>Import a (V)anilla Card</blue>, <red>Go (B)ack</red>: ",
		"b",
		(input) => {
			const type = input[0].toLowerCase();

			game.interact.cls();

			if (type === "v") {
				// This is to throw an error if it can't find the vanilla cards
				game.functions.card.vanilla.getAll();

				logger.debug("Starting Vanilla Card Creator...");
				vcc.main();
				logger.debug("Starting Vanilla Card Creator...OK");
			} else if (type === "c") {
				logger.debug("Starting Custom Card Creator...");
				ccc.main();
				logger.debug("Starting Custom Card Creator...OK");
			}
		},
	);
}

/**
 * More developer friendly options.
 */
function devmode() {
	userInputLoop(
		"<green>Create a (C)ard</green>, <blue>Create a Clas(s)</blue>, <yellow>Enter CLI (m)ode</yellow>, <red>Go (B)ack to Normal Mode</red>: ",
		"b",
		(input) => {
			const command = input[0].toLowerCase();

			switch (command) {
				case "c": {
					logger.debug("Loading Card Creator options...");
					cardCreator();
					logger.debug("Loading Card Creator options...OK");
					break;
				}

				case "s": {
					logger.debug("Starting Class Creator...");
					clc.main();
					logger.debug("Starting Class Creator...OK");
					break;
				}

				case "m": {
					logger.debug("Starting CLI...");
					cli.main(userInputLoop);
					logger.debug("Starting CLI...OK");
					break;
				}

				// No default
			}
		},
	);
}

logger.debug("Starting Hub...OK");

userInputLoop(
	"<green>(P)lay</green>, <blue>Create a (D)eck</blue>, <yellow>Developer (M)ode</yellow>, <red>(E)xit</red>: ",
	"e",
	(input) => {
		const command = input[0].toLowerCase();

		switch (command) {
			case "p": {
				logger.debug("Starting Game...");
				src.main();

				/*
				 * This line will likely never be seen in a log file, since the log file gets generated before this line.
				 * All the other similar lines are fine, since only the game generates log files for now.
				 */
				logger.debug("Starting Game...OK");
				break;
			}

			case "d": {
				logger.debug("Starting Deck Creator...");
				dc.main();
				logger.debug("Starting Deck Creator...OK");
				break;
			}

			case "m": {
				logger.debug("Loading Developer Mode options...");
				devmode();
				logger.debug("Loading Developer Mode options...OK");
				break;
			}

			// No default
		}
	},
);
