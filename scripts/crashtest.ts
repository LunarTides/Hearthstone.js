import process from "node:process";
import { createGame } from "@Core/game.js";
import { Player } from "@Core/player.js";

const { game } = createGame();

const gamesEnv = process.env.GAMES ?? "";
let games = game.lodash.parseInt(gamesEnv);
games = Number.isNaN(games) ? 10 : games;

/**
 * Executes the main function for the program.
 */
async function main(): Promise<void> {
	const decks = JSON.parse(
		game.functions.util.fs("read", "/decks.json") as string,
	) as string[];

	console.warn("Looking for crashes... This might take a while...");
	if (!process.env.GAMES) {
		console.warn(
			"Set the GAMES env variable to change how many games to play.",
		);
	}

	console.warn(
		"NOTE: If you see no progress being made for an extended period of time, chances are that the game got stuck in an infinite loop.",
	);

	for (let index = 0; index < games; index++) {
		// Show a progress bar
		process.stderr.write(`\r\u001B[KPlaying game ${index + 1} / ${games}...`);

		// Test the main game
		const { game, player1, player2 } = createGame();

		// Setup the ais
		game.config.ai.player1 = true;
		game.config.ai.player2 = true;
		game.doConfigAi();

		game.noInput = true;
		game.noOutput = true;

		// Choose random decks for the players
		for (let i = 0; i < 2; i++) {
			const player = Player.fromID(i);

			const deck = game.lodash.sample(decks);
			if (typeof deck === "string") {
				await game.functions.deckcode.import(player, deck);
			}
		}

		await game.startGame();
		await game.functions.interact.promptMulligan(player1);
		await game.functions.interact.promptMulligan(player2);

		try {
			while (game.running) {
				await game.functions.interact.gameloop();
			}
		} catch (error) {
			if (!(error instanceof Error)) {
				throw new TypeError("error is not of error type");
			}

			game.noOutput = false;

			// If it crashes, show the ai's actions, and the history of the game before actually crashing
			game.config.general.debug = true;
			await game.functions.util.createLogFile(error);

			await game.functions.interact.processCommand("/ai");
			await game.functions.interact.processCommand("history", { debug: true });

			console.log(
				"THE GAME CRASHED: LOOK ABOVE FOR THE HISTORY, AND THE AI'S LOGS.",
			);

			throw error;
		}
	}

	/*
	 * Create a new game to reset `noOutput` to false.
	 * Trust me, it doesn't log anything without this
	 */
	createGame();
	console.warn("\n<green>Crash test passed!</green>");
	process.exit();
}

await main();
