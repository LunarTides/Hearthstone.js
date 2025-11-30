/**
 * The actual entry point of the game.
 */

import { createGame } from "@Game/game.ts";

/**
 * Starts the game.
 */
export async function main(): Promise<void> {
	const { game, player1, player2 } = await createGame();
	game.interest("Creating game...OK");

	game.functions.interact.print.watermark();

	// Ask the players for deck codes.
	game.interest("Asking players for deck codes...");

	for (const player of [player1, player2]) {
		if (player.deck.length > 0) {
			continue;
		}

		// Put this in a while loop to make sure the function repeats if it fails.
		while (!(await game.prompt.deckcode(player))) {
			// Pass
		}
	}

	game.interest("Asking players for deck codes...OK");

	game.interest("Starting game...");
	await game.startGame();
	game.interest("Starting game...OK");

	game.interest("Performing mulligan...");
	await game.prompt.mulligan(player1);
	await game.prompt.mulligan(player2);
	game.interest("Performing mulligan...OK");

	game.interest("Finished setting up game.");
	game.interest("Starting game loop...");

	try {
		// Game loop
		while (game.running) {
			await game.functions.interact.gameloop();
		}

		game.interest("Starting game loop...OK");
	} catch (error) {
		if (!(error instanceof Error)) {
			throw new TypeError(
				"error is not of error type when catching from gameloop",
			);
		}

		game.interest("Starting game loop...OK");
		game.interest("Crash at game loop.");
		game.interest("Creating log file...");
		game.interest("Throwing error, goodbye!");

		// Create error report file
		await game.functions.util.createLogFile(error);

		throw error;
	}

	game.interest("Game finished successfully.");

	// Create log file
	await game.functions.util.createLogFile();
}
