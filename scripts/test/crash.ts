import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import { Player } from "@Game/player.ts";
import process from "node:process";

const { game } = await createGame();
const blueprints = game.blueprints;

const cards = await Card.all(true);

const gamesEnv = process.env.GAMES ?? "";
let games = game.lodash.parseInt(gamesEnv);
games = Number.isNaN(games) ? 10 : games;

/**
 * Executes the main function for the program.
 */
async function main(): Promise<void> {
	console.warn("Looking for crashes... This might take a while...");
	if (!gamesEnv) {
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
		const { game } = await createGame(false);
		game.blueprints = blueprints;

		// Setup the ais
		game.config.ai.player1 = true;
		game.config.ai.player2 = true;
		game.doConfigAi();

		game.noInput = true;
		game.noOutput = true;

		// Choose random decks for the players
		for (let i = 0; i < 2; i++) {
			const player = Player.fromID(i);

			for (let j = 0; j < 30; j++) {
				const card = game.lodash.sample(cards);
				if (!card) {
					throw new Error("No cards found");
				}

				player.addToDeck(await card.imperfectCopy());
			}
		}

		await game.startGame();

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
			game.config.debug.commands = true;
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
	await createGame();
	console.warn("\n<green>Crash test passed!</green>");
	process.exit();
}

await main();
