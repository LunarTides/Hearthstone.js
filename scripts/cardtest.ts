/**
 * Tests that cards works properly.
 * Executes the `test` ability on all cards in its own env.
 */

import process from "node:process";
import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import { Ability, EventListenerMessage } from "@Game/types.ts";

const { game } = await createGame();
const blueprints = game.blueprints;
const cards = await Card.all(true);

export async function main(): Promise<void> {
	let todos = 0;

	for (const [index, card] of cards.entries()) {
		process.stderr.write(
			`\r\u001B[KTesting card ${index + 1} / ${cards.length}...`,
		);

		// Create a game
		const { game, player1, player2 } = await createGame(false);
		game.noOutput = true;
		game.blueprints = blueprints;
		game.config.ai.player1 = false;
		game.config.ai.player2 = false;
		player1.ai = undefined;
		player2.ai = undefined;

		// NOTE: For some bizzare reason, if we remove these lines,
		// the game will get stuck in an infinite loop.
		// This makes no sense, but whatever...
		game.player = player1;
		game.opponent = player2;

		for (let i = 0; i < 30; i++) {
			const sheep1 = await Card.create(game.cardIds.sheep1, game.player1);
			const sheep2 = await Card.create(game.cardIds.sheep1, game.player2);
			game.player1.deck.push(sheep1);
			game.player2.deck.push(sheep2);
		}

		await game.startGame();
		card.owner = player1;

		try {
			const returnValue = await card.trigger(Ability.Test);

			if (
				Array.isArray(returnValue) &&
				returnValue.includes(EventListenerMessage.Skip)
			) {
				todos++;
			}
		} catch (error) {
			game.noOutput = false;

			if (error instanceof Error) {
				console.error(
					`<red>ERROR: ${card.name} (${card.id}) didn't pass its test. Here is the error. THIS ERROR IS PART OF THE SCRIPT, NOT AN ACTUAL ERROR.</red>`,
				);

				console.error(error.stack);
				console.error();
				process.exitCode = 1;
			}
		}

		game.noOutput = false;
	}

	console.log();

	if (process.exitCode !== 1) {
		console.log("<bright:green>All tests passed!</bright:green>");
	}

	if (todos > 0) {
		console.log("<cyan>%d todos.</cyan>", todos);
	}

	console.log();
	process.exit();
}

await main();
