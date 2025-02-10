/**
 * The actual entry point of the game.
 */

import { createGame } from "@Core/game.js";
import { validate as validateIds } from "../scripts/id/lib.js";

/**
 * Starts the game.
 */
export async function main(): Promise<void> {
	const { game, player1, player2 } = createGame();
	game.logger.debug("Creating game...OK");

	game.functions.interact.printWatermark();

	// Find holes and dupes in the ids
	console.warn("\nValidating ids...");
	game.logger.debug("Validating ids...");

	const [holes, dupes] = validateIds(true);
	game.logger.debug(`Validating ids...${holes} holes, ${dupes} duplicates`);

	if (holes > 0 || dupes > 0) {
		/*
		 * If there were holes or dupes, pause the game so that the user gets a
		 * chance to see what the problem was
		 */
		await game.pause();
	}

	// Ask the players for deck codes.
	game.logger.debug("Asking players for deck codes...");

	for (const player of [player1, player2]) {
		if (player.deck.length > 0) {
			continue;
		}

		// Put this in a while loop to make sure the function repeats if it fails.
		while (!(await game.functions.interact.promptDeckcode(player))) {
			// Pass
		}
	}

	game.logger.debug("Asking players for deck codes...OK");

	game.logger.debug("Starting game...");
	await game.startGame();
	game.logger.debug("Starting game...OK");

	game.logger.debug("Performing mulligan...");
	await game.functions.card.promptMulligan(player1);
	await game.functions.card.promptMulligan(player2);
	game.logger.debug("Performing mulligan...OK");

	game.logger.debug("Finished setting up game.");
	game.logger.debug("Starting game loop...");

	try {
		// Game loop
		while (game.running) {
			await game.functions.interact.gameloop();
		}

		game.logger.debug("Starting game loop...OK");
	} catch (error) {
		if (!(error instanceof Error)) {
			throw new TypeError(
				"error is not of error type when catching from gameloop",
			);
		}

		game.logger.debug("Starting game loop...OK");
		game.logger.debug("Crash at game loop.");
		game.logger.debug("Creating log file...");
		game.logger.debug("Throwing error, goodbye!");

		// Create error report file
		await game.functions.util.createLogFile(error);

		throw error;
	}

	game.logger.debug("Game finished successfully.");

	// Create log file
	await game.functions.util.createLogFile();
}
