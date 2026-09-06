/**
 * The entry point of the program. Acts like a hub between the tools and the game.
 */
import { createGame } from "@Game/game.ts";
import { validate as validateIds } from "./tools/id/lib.ts";

await createGame();

import { main as cli, isCLICommand } from "./tools/cli.ts";

// Handle CLI commands.
if (isCLICommand()) {
	await cli();
}

import * as hub from "./hub.ts";
import { checkForIssues } from "./universe/microscope/lib.ts";

hub.watermark();

// Find holes and dupes in the ids
game.interest("Validating ids...");
const dupes = await validateIds(true, false);
game.interest(`Validating ids...${dupes} duplicates`);

if (dupes > 0) {
	/*
	 * If there were holes or dupes, pause the game so that the user gets a
	 * chance to see what the problem was
	 */
	console.log();
	await game.pause();
}

game.interest("Querying [microscope] for issues...");
console.log("Querying [microscope] for issues...");
const issues = await checkForIssues();
game.interest(
	`Querying [microscope] for issues...${issues === 0 ? "OK" : `${issues} issue(s) found`}`,
);
if (issues > 0) {
	// If there were any issues, pause the game so the user can see what the problem was.
	console.log();
	await game.pause();
}

await hub.main();

process.exit();
