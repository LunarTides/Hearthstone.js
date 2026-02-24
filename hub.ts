/**
 * The entry point of the program. Acts like a hub between the tools and the game.
 */
import { Card } from "@Game/card.ts";
import { UILoopDefaultOptions } from "@Game/functions/interact.ts";
import { confirm, Separator } from "@inquirer/prompts";
import * as src from "./src/index.ts"; // Source Code
import * as clc from "./tools/cardcreator/class.ts"; // Class Creator
import * as ccc from "./tools/cardcreator/custom.ts"; // Custom Card Creator
import * as vcc from "./tools/cardcreator/vanilla.ts"; // Vanilla Card Creator
import * as dc from "./tools/deckcreator.ts"; // Deck Creator
import * as pkgr from "./tools/pack/packager.ts"; // Packager
import * as cardTest from "./tools/test/cards.ts"; // Card Test
import * as crashTest from "./tools/test/crash.ts"; // Crash Test
import * as soundTest from "./tools/test/sound.ts"; // Sound Test
import * as generateVanilla from "./tools/vanilla/generate.ts";

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
		game.isEventActive(game.time.events.anniversary) ? "🎂" : "",
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

export async function createUILoop(
	rawOptions: Partial<typeof UILoopDefaultOptions> = UILoopDefaultOptions,
	...choices: (
		| Separator
		| {
				name: string;
				description?: string;
				disabled?: boolean;
				defaultSound?: boolean;
				callback?: (value: number) => Promise<boolean>;
		  }
	)[]
) {
	return await game.prompt.createUILoop(
		{
			callbackBefore: async () => watermark(true),
			...rawOptions,
		},
		...choices,
	);
}

export async function playDelve() {
	game.functions.audio.playSFX("ui.delve");
}

export async function playBack() {
	await game.functions.audio.playSFX("ui.back");
}

export async function playLeaveUILoop() {
	await game.functions.audio.playSFX("ui.leaveLoop");
}

export async function playAction1() {
	await game.functions.audio.playSFX("ui.action1");
}

/**
 * Asks the user which card creator variant they want to use.
 */
export async function cardCreator() {
	await createUILoop(
		{
			message: "Create a Card",
		},
		{
			name: "Create a Custom Card",
			defaultSound: false,
			callback: async () => {
				playLeaveUILoop();

				game.interest("Starting Custom Card Creator...");
				await ccc.main({});
				game.interest("Starting Custom Card Creator...OK");

				return true;
			},
		},
		{
			name: "Create a Vanilla Card",
			defaultSound: false,
			callback: async () => {
				// This is to throw an error if it can't find the vanilla cards
				await game.functions.card.vanilla.getAll();
				playLeaveUILoop();

				game.interest("Starting Vanilla Card Creator...");
				await vcc.main();
				game.interest("Starting Vanilla Card Creator...OK");

				return true;
			},
		},
	);
}

/**
 * More developer friendly options.
 */
export async function devmode() {
	await createUILoop(
		{
			message: "Developer Options",
		},
		{
			name: "Create a Card",
			callback: async () => {
				game.interest("Loading Card Creator options...");
				await cardCreator();
				game.interest("Loading Card Creator options...OK");

				return true;
			},
		},
		{
			name: "Create a Class",
			defaultSound: false,
			callback: async () => {
				playLeaveUILoop();

				game.interest("Starting Class Creator...");
				await clc.main();
				game.interest("Starting Class Creator...OK");

				return true;
			},
		},
		new Separator(),
		{
			name: "Test Cards",
			defaultSound: false,
			callback: async () => {
				playLeaveUILoop();

				game.interest("Starting Card Test...");
				await cardTest.main();
				game.interest("Starting Card Test...OK");

				return true;
			},
		},
		{
			name: "Test Crash",
			defaultSound: false,
			callback: async () => {
				playLeaveUILoop();

				game.interest("Starting Crash Test...");
				await crashTest.main();
				game.interest("Starting Crash Test...OK");

				return true;
			},
		},
		{
			name: "Test Sounds",
			// NOTE: The user should be able to choose this option and see the resulting error,
			// therefore, the following line is commented out.
			// disabled: game.config.audio.disable,
			defaultSound: false,
			callback: async () => {
				playLeaveUILoop();

				game.interest("Starting Sound Test...");
				await soundTest.main();
				game.interest("Starting Sound Test...OK");

				return true;
			},
		},
		{
			name: "Generate Vanilla Cards",
			callback: async () => {
				// TODO: Move this to the tool.
				if (!game.config.networking.allow.game) {
					console.error(
						"<red>Networking access denied. Please enable 'Networking > Allow > Game' to continue. Aborting.</red>",
					);
					console.error();
					await game.pause();
					return true;
				}

				const sure = await confirm({
					message:
						"Are you sure you want to generate the vanilla cards? Doing this will query an API.",
					default: false,
				});
				if (!sure) {
					return true;
				}

				playLeaveUILoop();

				game.interest("Generating vanilla cards...");
				await generateVanilla.main();
				game.interest("Generating vanilla cards...OK");

				return true;
			},
		},
	);
}

export async function main() {
	await createUILoop(
		{
			message: "Options",
			backButtonText: "Exit",
		},
		{
			name: "Play",
			defaultSound: false,
			callback: async () => {
				playLeaveUILoop();

				game.interest("Starting Game...");
				await src.main();

				/*
				 * This line will never be seen in the log file, since the log file gets generated before this line.
				 * All the other similar lines are fine, since only the game generates log files for now.
				 */
				game.interest("Starting Game...OK");
				return true;
			},
		},
		{
			name: "Create a Deck",
			defaultSound: false,
			callback: async () => {
				playLeaveUILoop();

				game.interest("Starting Deck Creator...");
				await dc.main();
				game.interest("Starting Deck Creator...OK");

				return true;
			},
		},
		new Separator(),
		{
			name: "Pack Options",
			callback: async () => {
				game.interest("Starting Packager...");
				await pkgr.main();
				game.interest("Starting Packager...OK");

				return true;
			},
		},
		{
			name: "Developer Options",
			callback: async () => {
				game.interest("Loading Developer Mode options...");
				await devmode();
				game.interest("Loading Developer Mode options...OK");

				return true;
			},
		},
	);
}
