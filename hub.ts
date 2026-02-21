/**
 * The entry point of the program. Acts like a hub between the tools and the game.
 */
import { Card } from "@Game/card.ts";
import { confirm, Separator } from "@inquirer/prompts";
import * as src from "./src/index.ts"; // Source Code
import * as clc from "./tools/cardcreator/class.ts"; // Class Creator
import * as ccc from "./tools/cardcreator/custom.ts"; // Custom Card Creator
import * as vcc from "./tools/cardcreator/vanilla.ts"; // Vanilla Card Creator
import * as dc from "./tools/deckcreator.ts"; // Deck Creator
import * as pkgr from "./tools/pack/packager.ts"; // Packager
import * as cardTest from "./tools/test/cards.ts"; // Card Test
import * as crashTest from "./tools/test/crash.ts"; // Crash Test
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

const UILoopDefaultOptions = {
	callbackBefore: watermark as () => Promise<void>,
	message: "Options" as string,
	seperatorBeforeBackButton: true as boolean,
	backButtonText: "Back" as string,
};

export async function createUILoop(
	rawOptions: Partial<typeof UILoopDefaultOptions> = UILoopDefaultOptions,
	...choices: (
		| Separator
		| {
				name: string;
				description?: string;
				disabled?: boolean;
				callback?: (value: number) => Promise<boolean>;
		  }
	)[]
) {
	const options = {
		...UILoopDefaultOptions,
		...rawOptions,
	};

	while (true) {
		if (options.callbackBefore) {
			await options.callbackBefore();
		}

		const answer = await game.prompt.customSelect(
			options.message,
			[],
			{
				hideBack: true,
				arrayTransform: undefined,
			},
			...choices.map((choice, i) => ({
				...choice,
				value: i.toString(),
			})),
			options.seperatorBeforeBackButton && new Separator(),
			{
				name: options.backButtonText,
				value: "back",
			},
		);

		if (answer === "back") {
			break;
		}

		const parsed = Number.parseInt(answer, 10);
		const choice = choices[parsed];
		if (choice instanceof Separator) {
			throw new Error("Selected a seperator");
		}

		const result = await choice.callback?.(parsed);
		if (result === false) {
			break;
		}
	}
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
			callback: async () => {
				game.interest("Starting Custom Card Creator...");
				await ccc.main({});
				game.interest("Starting Custom Card Creator...OK");

				return true;
			},
		},
		{
			name: "Create a Vanilla Card",
			callback: async () => {
				// This is to throw an error if it can't find the vanilla cards
				await game.functions.card.vanilla.getAll();

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
			callback: async () => {
				game.interest("Starting Class Creator...");
				await clc.main();
				game.interest("Starting Class Creator...OK");

				return true;
			},
		},
		new Separator(),
		{
			name: "Test Cards",
			callback: async () => {
				game.interest("Starting Card Test...");
				await cardTest.main();
				game.interest("Starting Card Test...OK");

				return true;
			},
		},
		{
			name: "Test Crash",
			callback: async () => {
				game.interest("Starting Crash Test...");
				await crashTest.main();
				game.interest("Starting Crash Test...OK");

				return true;
			},
		},
		{
			name: "Generate Vanilla Cards",
			callback: async () => {
				// TODO: Move this to the tool.
				if (!game.config.networking.allow.game) {
					console.error(
						"<yellow>Networking access denied. Please enable 'Networking > Allow > Game' to continue. Aborting.</yellow>",
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
			callback: async () => {
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
			callback: async () => {
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
