/**
 * Tests that cards works properly.
 * Executes the `test` ability on all cards in its own env.
 */

import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import { Ability, EventListenerMessage } from "@Game/types.ts";
import process from "node:process";

const { game } = await createGame();
const blueprints = game.blueprints;
const cards = await Card.all(true);

function calculatePercentage(x: number, subtract = 0) {
	return Math.round((x / (cards.length - subtract)) * 100);
}

export async function main(): Promise<void> {
	let passed = 0;
	let fails = 0;
	let todos = 0;
	let skips = 0;

	for (const [index, card] of cards.entries()) {
		if (!card.abilities.test) {
			skips++;
			continue;
		}

		process.stderr.write(
			`\r\u001B[KTesting card ${index + 1} / ${cards.length}...`,
		);

		// Create a game
		const { game, player1, player2 } = await createGame(false);
		game.noOutput = true;
		game.blueprints = blueprints;
		game.config.ai.player1 = false;
		game.config.ai.player2 = false;
		game.config.ai.random = false;
		player1.ai = undefined;
		player2.ai = undefined;

		// NOTE: For some bizzare reason, if we remove these lines,
		// the game will get stuck in an infinite loop.
		// This makes no sense, but whatever...
		game.player = player1;
		game.opponent = player2;

		for (let i = 0; i < 30; i++) {
			const sheep1 = await Card.create(game.cardIds.sheep_1, game.player1);
			const sheep2 = await Card.create(game.cardIds.sheep_1, game.player2);
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

			passed++;
		} catch (error) {
			game.noOutput = false;

			if (error instanceof Error) {
				fails++;
				console.error(
					`<red>ERROR: ${card.name} (${card.id}) didn't pass its test. Here is the error:</red>`,
				);

				console.error(error.stack);
				console.error();
				process.exitCode = 1;
			}
		}

		game.noOutput = false;
	}

	console.log(
		"\n\n<bright:green>Passed: %d/%d (%d%)</bright:green>",
		passed - todos,
		cards.length - skips,
		calculatePercentage(passed - todos, skips),
	);
	console.log(
		"<red>Failed: %d/%d (%d%)</red>",
		fails,
		cards.length - skips,
		calculatePercentage(fails, skips),
	);
	console.log(
		"<cyan>Todos: %d/%d (%d%)</cyan>",
		todos,
		cards.length - skips,
		calculatePercentage(todos, skips),
	);
	console.log("<gray>Untestable: %d/%d</gray>", skips, cards.length);
	console.log(
		"<gray>(Untestable cards aren't included in the percentages.)</gray>",
	);
	if (process.exitCode !== 1) {
		console.log("\n<bright:green>All tests passed!</bright:green>");
	}
	console.log();
	process.exit();
}

await main();
