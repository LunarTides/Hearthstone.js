import { createGame } from "@Game/game.ts";
import { describe, expect, test } from "bun:test";

/*
 * Need to create a game in case the functions need it.
 * This is a pretty big performance hit.
 */
await createGame();

describe("src/game", () => {
	test.todo("input", async () => {});
	test.todo("pause", async () => {});
	test.todo("interest", async () => {});
	test.todo("translate", async () => {});
	test.todo("doConfigAi", async () => {});
	test.todo("isEventActive", async () => {});
	test.todo("startGame", async () => {});
	test.todo("endGame", async () => {});
	test.todo("endTurn", async () => {});

	test("turnCounter", async () => {
		/*
		 * Game.turn will be set to 1 when starting the game,
		 * but since the game has not started yet, it will be 0
		 * We can't start the game since it would immediately end the game again
		 * since a player would die in the starting phase
		 */
		game.turn = 1;

		let counter = game.turnCounter();
		expect(counter).toEqual(1);

		await game.endTurn();
		await game.endTurn();

		// Turn starts at 1, every `game.endTurn` increments it by 1, 1 + 2 = 3
		expect(game.turn).toEqual(3);

		counter = game.turnCounter();
		expect(counter).toEqual(2);
	});

	test.todo("randomTarget", async () => {});
	test.todo("randomTargetRelative", async () => {});
	test.todo("summon", async () => {});
	test.todo("killCardsOnBoard", async () => {});
	test.todo("createGame", async () => {});
	test.todo("attack", async () => {});
});
