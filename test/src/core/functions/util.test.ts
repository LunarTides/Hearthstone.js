import { describe, expect, test } from "bun:test";
import { utilFunctions } from "@Core/functions/util.js";
import { createGame } from "@Core/game.js";

/*
 * Need to create a game in case the functions need it
 * This is a pretty big performance hit.
 */
createGame();

describe("src/core/functions/util", () => {
	test("remove", async () => {
		const list = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];

		utilFunctions.remove(list, 3);

		/*
		 * One 3 should be removed, not both.
		 * This is why it exists, instead of using lodash.remove
		 */
		expect(list).toEqual([1, 1, 2, 2, 3, 4, 4, 5, 5]);
	});

	test("createWall", async () => {
		const bricks = [
			"Example - Example",
			"Test - Hello World",
			"This is the longest - Short",
			"Tiny - This is even longer then that one!",
		];

		const wall = utilFunctions.createWall(bricks, "-");

		expect(wall).toEqual([
			"Example             - Example",
			"Test                - Hello World",
			"This is the longest - Short",
			"Tiny                - This is even longer then that one!",
		]);
	});

	test.todo("importConfig", async () => {
		expect(false).toEqual(true);
	});

	test.todo("createLogFile", async () => {
		expect(false).toEqual(true);
	});

	test.todo("parseLogFile", async () => {
		expect(false).toEqual(true);
	});

	test("runCommand", async () => {
		/*
		 * Bun is the only program that is guaranteed to be installed
		 * We shouldn't count on other programs / commands being installed here
		 */
		const command = "bun --version";
		const result = utilFunctions.runCommand(command);

		expect(result).toStartWith(Bun.version);
	});

	test.todo("tryCompile", async () => {
		expect(false).toEqual(true);
	});

	test.todo("runCommandAsChildProcess", async () => {
		expect(false).toEqual(true);
	});

	test.todo("openInBrowser", async () => {
		expect(false).toEqual(true);
	});

	test("getTraditionalTurnCounter", async () => {
		/*
		 * Game.turn will be set to 1 when starting the game,
		 * but since the game has not started yet, it will be 0
		 * We can't start the game since it would immediately end the game again
		 * since a player would die in the starting phase
		 */
		game.turn = 1;

		let counter = utilFunctions.getTraditionalTurnCounter();
		expect(counter).toEqual(1);

		await game.endTurn();
		await game.endTurn();

		// Turn starts at 1, every `game.endTurn` increments it by 1, 1 + 2 = 3
		expect(game.turn).toEqual(3);

		counter = utilFunctions.getTraditionalTurnCounter();
		expect(counter).toEqual(2);
	});

	test.todo("fs", async () => {
		expect(false).toEqual(true);
	});

	test.todo("searchCardsFolder", async () => {
		expect(false).toEqual(true);
	});

	test("restrictPath", async () => {
		const match = (path: string) => {
			expect(utilFunctions.restrictPath(path)).toEqual(
				`${utilFunctions.dirname()}/cards/`,
			);
		};

		// All of these should resolve to "(Path to the folder where hearthstone.js is stored)/Hearthstone.js/cards/"
		match("/cards/");
		match("~/cards/");
		match("./cards/");
		match("cards/");
		match(`${utilFunctions.dirname()}/cards/`);

		// Try to escape the directory, shouldn't work
		match("../cards/");

		/*
		 * Try different exploits.
		 * If it removes the first instance of "../",
		 * it should become "../cards/"
		 *
		 * This shouldn't work though
		 */
		match("..././cards/");

		/**
		 * If it removes the first instance of "..", and then "../",
		 * it should become "../cards/"
		 *
		 * This also shouldn't work, since it removes all instances of ".." and "../"
		 */
		match("....././cards/");
	});

	test.todo("dirname", async () => {
		// I don't know how to test this
		expect(false).toEqual(true);
	});

	test.todo("getRandomTarget", async () => {
		expect(false).toEqual(true);
	});
});
