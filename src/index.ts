/**
 * The entry point of the game.
 *
 * @module Index
 */

import { validate as validateIds } from "../scripts/id/lib.js";
import { createGame } from "./internal.js";

/**
 * Starts the game.
 */
export async function main(): Promise<void> {
	logger.debug("Creating game...");
	const { game, player1, player2 } = createGame();
	logger.debug("Creating game...OK");

	game.interact.info.watermark();

	// Find holes and dupes in the ids
	console.warn("\nValidating ids...");
	logger.debug("Validating ids...");

	const [holes, dupes] = validateIds(true);
	logger.debug(`Validating ids...${holes} holes, ${dupes} duplicates`);

	if (holes > 0 || dupes > 0) {
		/*
		 * If there were holes or dupes, pause the game so that the user gets a
		 * chance to see what the problem was
		 */
		await game.pause();
	}

	// Ask the players for deck codes.
	logger.debug("Asking players for deck codes...");

	for (const player of [player1, player2]) {
		if (player.deck.length > 0) {
			continue;
		}

		// Put this in a while loop to make sure the function repeats if it fails.
		while (!(await game.interact.deckCode(player))) {
			// Pass
		}
	}

	logger.debug("Asking players for deck codes...OK");

	logger.debug("Starting game...");
	await game.startGame();
	logger.debug("Starting game...OK");

	logger.debug("Performing mulligan...");
	await game.interact.card.mulligan(player1);
	await game.interact.card.mulligan(player2);
	logger.debug("Performing mulligan...OK");

	logger.debug("Finished setting up game.");
	logger.debug("Starting game loop...");

	try {
		// Game loop
		while (game.running) {
			await game.interact.gameLoop.doTurn();
		}

		logger.debug("Starting game loop...OK");
	} catch (error) {
		if (!(error instanceof Error)) {
			throw new TypeError(
				"error is not of error type when catching from gameloop",
			);
		}

		logger.debug("Starting game loop...OK");
		logger.debug("Crash at game loop.");
		logger.debug("Creating log file...");
		logger.debug("Throwing error, goodbye!");

		// Create error report file
		await game.functions.util.createLogFile(error);

		throw error;
	}

	logger.debug("Game finished successfully.");

	// Create log file
	await game.functions.util.createLogFile();
}
