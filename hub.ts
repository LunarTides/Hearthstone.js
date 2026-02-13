/**
 * The entry point of the program. Acts like a hub between the tools / scripts and the game.
 */
import { Card } from "@Game/card.ts";
import { confirm, Separator } from "@inquirer/prompts";
import * as cardTest from "./scripts/test/cards.ts"; // Card Test
import * as crashTest from "./scripts/test/crash.ts"; // Crash Test
import * as generateVanilla from "./scripts/vanilla/generate.ts";
import * as src from "./src/index.ts"; // Source Code
import * as clc from "./tools/cardcreator/class.ts"; // Class Creator
import * as ccc from "./tools/cardcreator/custom.ts"; // Custom Card Creator
import * as vcc from "./tools/cardcreator/vanilla.ts"; // Vanilla Card Creator
import * as dc from "./tools/deckcreator.ts"; // Deck Creator
import * as pkgr from "./tools/packager.ts"; // Packager

// These are here so we don't have to recalculate them every watermark call.
const version = game.functions.info.versionString(4);
const customCardsAmount = (await Card.all(true)).length;
const collectibleCardsAmount = (await Card.all(false)).length;
let vanillaCardsAmount = Number.NaN;
let collectibleVanillaCardsAmount = Number.NaN;

try {
	// `vanilla.getAll` will throw an error if the `vanillacards.json` file is missing.
	const vanillaCards = await game.functions.card.vanilla.getAll();
	vanillaCardsAmount = vanillaCards.length;
	collectibleVanillaCardsAmount = vanillaCards.filter(
		(card) => card.collectible,
	).length;
} catch {}

/**
 * Clears the console and prints the version information of the Hearthstone.js Hub.
 */
export const watermark = (showCards = true) => {
	game.functions.interact.cls();

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
    `.replace("\n", ""), // Remove the first newline in order to improve formatting in source code.
	);

	console.log(
		"Version: %s %s",
		version,
		game.isEventActive(game.time.events.anniversary) && "🎂",
	);

	if (showCards) {
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
	}

	console.log();
};

/**
 * Asks the user which card creator variant they want to use.
 */
export async function cardCreator() {
	while (true) {
		watermark();
		const answer = await game.prompt.customSelect("Create a Card", [
			"Create a Custom Card",
			"Import a Vanilla Card",
		]);

		if (answer === "0") {
			game.interest("Starting Custom Card Creator...");
			await ccc.main({});
			game.interest("Starting Custom Card Creator...OK");
		} else if (answer === "1") {
			// This is to throw an error if it can't find the vanilla cards
			await game.functions.card.vanilla.getAll();

			game.interest("Starting Vanilla Card Creator...");
			await vcc.main();
			game.interest("Starting Vanilla Card Creator...OK");
		} else if (answer === "Back") {
			break;
		}
	}
}

/**
 * More developer friendly options.
 */
export async function devmode() {
	while (true) {
		watermark();

		const answer = await game.prompt.customSelect(
			"Developer Options",
			[],
			{
				hideBack: true,
				arrayTransform: undefined,
			},
			"Create a Card",
			"Create a Class",
			new Separator(),
			"Start Packager",
			new Separator(),
			"Test Cards",
			"Crash Test",
			"Generate Vanilla Cards",
			new Separator(),
			"Back",
		);

		if (answer === "create a card") {
			game.interest("Loading Card Creator options...");
			await cardCreator();
			game.interest("Loading Card Creator options...OK");
		} else if (answer === "create a class") {
			game.interest("Starting Class Creator...");
			await clc.main();
			game.interest("Starting Class Creator...OK");
		} else if (answer === "start packager") {
			game.interest("Starting Packager...");
			await pkgr.main();
			game.interest("Starting Packager...OK");
		} else if (answer === "test cards") {
			game.interest("Starting Card Test...");
			await cardTest.main();
			game.interest("Starting Card Test...OK");
		} else if (answer === "crash test") {
			game.interest("Starting Crash Test...");
			await crashTest.main();
			game.interest("Starting Crash Test...OK");
		} else if (answer === "generate vanilla cards") {
			if (!game.config.networking.allow.game) {
				console.error(
					"<yellow>Networking access denied. Please enable 'Networking > Allow > Game' to continue. Aborting.</yellow>",
				);
				console.error();
				await game.pause();
				continue;
			}

			const sure = await confirm({
				message:
					"Are you sure you want to generate the vanilla cards? Doing this will query an API.",
				default: false,
			});
			if (!sure) {
				continue;
			}

			game.interest("Generating vanilla cards...");
			await generateVanilla.main();
			game.interest("Generating vanilla cards...OK");
		} else if (answer === "back") {
			break;
		}
	}
}

export async function main() {
	while (true) {
		watermark();

		const answer = await game.prompt.customSelect(
			"Options",
			[],
			{
				hideBack: true,
				arrayTransform: undefined,
			},
			"Play",
			"Create a Deck",
			"Developer Options",
			new Separator(),
			"Exit",
		);

		if (answer === "play") {
			game.interest("Starting Game...");
			await src.main();

			/*
			 * This line will never be seen in the log file, since the log file gets generated before this line.
			 * All the other similar lines are fine, since only the game generates log files for now.
			 */
			game.interest("Starting Game...OK");
		} else if (answer === "create a deck") {
			game.interest("Starting Deck Creator...");
			await dc.main();
			game.interest("Starting Deck Creator...OK");
		} else if (answer === "developer options") {
			game.interest("Loading Developer Mode options...");
			await devmode();
			game.interest("Loading Developer Mode options...OK");
		} else if (answer === "exit") {
			break;
		}
	}
}
