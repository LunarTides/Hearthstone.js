/**
 * The entry point of the program. Acts like a hub between the tools and the game.
 */
import { Card } from "@Game/card.ts";
import { UILoopDefaultOptions } from "@Game/modules/interact/prompt.ts";
import { confirm, Separator } from "@inquirer/prompts";
import * as src from "./src/index.ts"; // Source Code
import * as dc from "./tools/deckcreator.ts"; // Deck Creator
import * as pkgr from "./tools/pack/packager.ts"; // Packager
import * as rm from "./tools/resource-manager/index.ts"; // Resource Manager
import * as cardTest from "./tools/test/cards.ts"; // Card Test
import * as crashTest from "./tools/test/crash.ts"; // Crash Test
import * as soundTest from "./tools/test/sound.ts"; // Sound Test
import * as generateVanilla from "./tools/vanilla/generate.ts";
import * as universe from "./universe/hub.ts";

// These are here so we don't have to recalculate them every watermark call.
const version = game.info.versionString(4);
const customCardsAmount = (await Card.all(true)).length;
const collectibleCardsAmount = (await Card.all(false)).length;
let vanillaCardsAmount = Number.NaN;
let collectibleVanillaCardsAmount = Number.NaN;

try {
	// `vanilla.getAll` will throw an error if the `vanillacards.json` file is missing.
	const vanillaCards = await game.card.vanilla.getAll();
	vanillaCardsAmount = vanillaCards.length;
	collectibleVanillaCardsAmount = vanillaCards.filter(
		(card) => card.collectible,
	).length;
} catch {}

/**
 * Clears the console and prints the version information of the Hearthstone.js Hub.
 */
export const watermark = (showCards = true) => {
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
    `.replace("\n", ""), // Remove the first newline in order to improve formatting in source code.
	);

	console.log(
		`Version: ${version} ${game.isEventActive(game.time.events.anniversary) ? "🎂" : ""}`,
	);

	if (showCards) {
		console.log(
			`Custom Cards: <yellow>${customCardsAmount}</yellow> (<green>${collectibleCardsAmount}</green> Collectible)`,
		);

		console.log(
			`Vanilla Cards: <blue>${vanillaCardsAmount}</blue> (<cyan>${collectibleVanillaCardsAmount}</cyan> Collectible)`,
		);
	}

	console.log();
};

export async function createUILoop(
	rawOptions: Partial<typeof UILoopDefaultOptions> = UILoopDefaultOptions,
	choicesGenerator: () => Promise<
		(
			| Separator
			| {
					name: string;
					description?: string;
					disabled?: boolean;
					defaultSound?: boolean;
					callback?: (value: number) => Promise<boolean>;
			  }
		)[]
	>,
) {
	return await game.prompt.createUILoop(
		{
			callbackBefore: async () => watermark(true),
			...rawOptions,
		},
		choicesGenerator,
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
		async () => [
			{
				name: "Manage Resources",
				callback: async () => {
					game.interest("Loading Resource Manager...");
					await rm.main();
					game.interest("Loading Resource Manager...OK");

					return true;
				},
			},
			new Separator(),
			{
				name: "Test Cards",
				defaultSound: false,
				callback: async () => {
					game.audio.playSFX("ui.leaveLoop");

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
					game.audio.playSFX("ui.leaveLoop");

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
					game.audio.playSFX("ui.leaveLoop");

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

					game.audio.playSFX("ui.leaveLoop");

					game.interest("Generating vanilla cards...");
					await generateVanilla.main();
					game.interest("Generating vanilla cards...OK");

					return true;
				},
			},
		],
	);
}

export async function main() {
	await createUILoop(
		{
			message: "Options",
			backButtonText: "Exit",
		},
		async () => [
			{
				name: "Play",
				defaultSound: false,
				callback: async () => {
					game.audio.playSFX("ui.leaveLoop");

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
					game.audio.playSFX("ui.leaveLoop");

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
				name: "Universe",
				callback: async () => {
					game.interest("Starting [universe] takeover...");
					await universe.takeover();
					game.interest("Starting [universe] takeover...OK");

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
		],
	);
}
