import { parseTags } from "chalk-tags";
import { type ErrorOptions, program } from "commander";
//import * as src from "../src/index.ts"; // Source Code
//import * as clc from "./cardcreator/class.ts"; // Class Creator
import * as ccc from "./cardcreator/custom.ts"; // Custom Card Creator
import * as vcc from "./cardcreator/vanilla.ts"; // Vanilla Card Creator
import * as dc from "./deckcreator.ts"; // Deck Creator

//import * as pkgr from "./pack/packager.ts"; // Packager
//import * as cardTest from "./test/cards.ts"; // Card Test
//import * as crashTest from "./test/crash.ts"; // Crash Test
//import * as generateVanilla from "./vanilla/generate.ts";

const error = (message: string, options?: ErrorOptions): never => {
	return program.error(parseTags(message), options);
};

// Program
program
	.name("hearthstone.js")
	.description("A console-based recreation of Hearthstone.js")
	.version(game.functions.info.versionString(4));

// Deck
const deck = program.command("deck").description("manage decks");
deck
	.command("create")
	.description("create a deck")
	.option("-i, --interactive", "use the interactive deck creator")
	.action(async (options) => {
		const interactive = options.interactive;
		if (interactive) {
			await dc.main();
			return;
		}

		error(
			"<red>Creating a deck non-interactively is not implemented yet.</red>",
		);
	});

// Card
const card = program.command("card").description("manage cards");

// - Create
const cardCreate = card.command("create").description("create a card");

// -- Custom
cardCreate
	.command("custom")
	.description("create a custom card")
	.option("-i, --interactive", "use the card creator interactively")
	.action(async (options) => {
		const interactive = options.interactive;
		if (interactive) {
			await ccc.main({});
			return;
		}

		error(
			"<red>Using the custom card creator non-interactively is not implemented yet.</red>",
		);
	});

// -- Vanilla
cardCreate
	.command("vanilla")
	.description("import a vanilla card")
	.option("-i, --interactive", "use the card creator interactively")
	.action(async (options) => {
		const interactive = options.interactive;
		if (interactive) {
			await vcc.main();
			return;
		}

		error(
			"<red>Using the vanilla card creator non-interactively is not implemented yet.</red>",
		);
	});

// -- Library
cardCreate
	.command("library")
	.description("create a card manually")
	.action(async (options) => {
		error("<red>Creating a card manually is not implemented yet.</red>");
	});

// TODO: Implement the rest.

export function isCLICommand(): boolean {
	const hasArgs = process.argv.length >= 3;
	return hasArgs;
}

export async function main(): Promise<never> {
	await program.parseAsync();
	process.exit();
}
