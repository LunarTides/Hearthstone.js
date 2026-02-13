/**
 * The entry point of the program. Acts like a hub between the tools and the game.
 */
import { createGame } from "@Game/game.ts";
import { validate as validateIds } from "./tools/id/lib.ts";

const { game } = await createGame();

import * as hub from "./hub.ts";

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

await hub.main();

process.exit();
