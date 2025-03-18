/**
 * Tests that cards works properly.
 * Executes the `test` ability on all cards in its own env.
 */

import process from "node:process";
import { Card } from "@Game/card.js";
import { createGame } from "@Game/game.js";
import type { Player } from "@Game/player.js";
import { Ability, EventListenerMessage } from "@Game/types.js";

const { game } = await createGame();
const blueprints = game.blueprints;
const cards = await Card.all(true);

/**
 * Tests that a card works properly by triggering the `test` ability.
 *
 * @param card The card to test
 *
 * @returns Success | Error
 */
async function testCard(card: Card): Promise<Error | "todo" | undefined> {
	try {
		const returnValue = await card.trigger(Ability.Test);

		if (
			Array.isArray(returnValue) &&
			returnValue.includes(EventListenerMessage.Skip)
		) {
			return "todo";
		}
	} catch (error) {
		if (error instanceof Error) {
			return error;
		}
	}

	return undefined;
}

// Assign decks
const assignDeck = async (player: Player) => {
	const deck = await game.functions.deckcode.import(player, "Mage /30/ 1");
	if (!deck || deck.length <= 0) {
		throw new Error("Invalid deckcode");
	}

	player.deck = deck;
};

/**
 * Executes a series of tests on the cards in the 'cards' array.
 */
export async function main(): Promise<void> {
	let todos = 0;

	for (const [index, blueprint] of cards.entries()) {
		process.stderr.write(
			`\r\u001B[KTesting card ${index + 1} / ${cards.length}...`,
		);

		// Create a game
		const { game, player1, player2 } = await createGame(false);
		game.blueprints = blueprints;
		game.config.ai.player1 = false;
		game.config.ai.player2 = false;
		game.doConfigAi();

		// NOTE: For some bizzare reason, if we remove these lines,
		// the game will get stuck in an infinite loop.
		// This makes no sense, but whatever...
		game.player = player1;
		game.opponent = player2;

		game.config.decks.validate = false;
		await assignDeck(player1);
		await assignDeck(player2);

		await game.startGame();

		const card = await blueprint.imperfectCopy();
		card.owner = player1;

		game.noOutput = true;
		const error = await testCard(card);
		game.noOutput = false;

		if (error instanceof Error) {
			console.error(
				`<red>ERROR: ${card.name} (${card.id}) didn't pass its test. Here is the error. THIS ERROR IS PART OF THE SCRIPT, NOT AN ACTUAL ERROR.</red>`,
			);

			console.error(error.stack);
			console.error();
			process.exitCode = 1;
		} else if (error === "todo") {
			todos++;
		}
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
