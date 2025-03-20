import { describe, expect, test } from "bun:test";
import { utilFunctions } from "@Game/functions/util.js";

describe("src/functions/util", () => {
	test("remove", async () => {
		const list = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];

		utilFunctions.remove(list, 3);

		/*
		 * One 3 should be removed, not both.
		 * This is why it exists, instead of using lodash.remove
		 */
		expect(list).toEqual([1, 1, 2, 2, 3, 4, 4, 5, 5]);
	});

	test("alignColumns", async () => {
		const columns = [
			"Example - Example",
			"Test - Hello World",
			"This is the longest - Short",
			"Tiny - This is even longer then that one!",
		];

		const alignedColumns = utilFunctions.alignColumns(columns, "-");

		expect(alignedColumns).toEqual([
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

	test.todo("getCachedLanguageMap", async () => {
		expect(false).toEqual(true);
	});

	test.todo("importLanguageMap", async () => {
		expect(false).toEqual(true);
	});

	test.todo("translate", async () => {
		expect(false).toEqual(true);
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

	test("parseEvalArgs", async () => {
		expect(
			await utilFunctions.parseEvalArgs(["console.log('Hello World')"]),
		).toEqual("(async () => { console.log('Hello World') })()");

		expect(await utilFunctions.parseEvalArgs(["log", '"Hello World"'])).toEqual(
			'(async () => { console.log("Hello World");await game.pause(); })()',
		);

		expect(
			await utilFunctions.parseEvalArgs([
				"log",
				"await",
				"game.functions.util.parseEvalArgs([\"console.log('hi')\"])",
			]),
		).toEqual(
			"(async () => { console.log(await game.functions.util.parseEvalArgs([\"console.log('hi')\"]));await game.pause(); })()",
		);

		// @
		expect(
			await utilFunctions.parseEvalArgs(["log", "@Player1.getName()"]),
		).toEqual(
			"(async () => { console.log(game.player1.getName());await game.pause(); })()",
		);

		expect(
			await utilFunctions.parseEvalArgs(["log", "@Player2.getName()"]),
		).toEqual(
			"(async () => { console.log(game.player2.getName());await game.pause(); })()",
		);

		expect(
			await utilFunctions.parseEvalArgs(["log", "@Player.getName()"]),
		).toEqual(
			"(async () => { console.log(game.player.getName());await game.pause(); })()",
		);

		// Location codes
		expect(await utilFunctions.parseEvalArgs(["log", "h#c#1.name"])).toEqual(
			"(async () => { console.log(game.player1.hand[1 - 1].name);await game.pause(); })()",
		);

		expect(await utilFunctions.parseEvalArgs(["log", "h#c#2.name"])).toEqual(
			"(async () => { console.log(game.player1.hand[2 - 1].name);await game.pause(); })()",
		);

		expect(await utilFunctions.parseEvalArgs(["log", "h#o#1.name"])).toEqual(
			"(async () => { console.log(game.player2.hand[1 - 1].name);await game.pause(); })()",
		);

		expect(await utilFunctions.parseEvalArgs(["log", "d#c#1.name"])).toEqual(
			"(async () => { console.log(game.player1.deck[1 - 1].name);await game.pause(); })()",
		);

		expect(await utilFunctions.parseEvalArgs(["log", "d#o#2.name"])).toEqual(
			"(async () => { console.log(game.player2.deck[2 - 1].name);await game.pause(); })()",
		);

		expect(await utilFunctions.parseEvalArgs(["log", "b#c#1.name"])).toEqual(
			"(async () => { console.log(game.player1.board[1 - 1].name);await game.pause(); })()",
		);

		expect(await utilFunctions.parseEvalArgs(["log", "b#o#5.name"])).toEqual(
			"(async () => { console.log(game.player2.board[5 - 1].name);await game.pause(); })()",
		);

		expect(await utilFunctions.parseEvalArgs(["log", "g#c#1.name"])).toEqual(
			"(async () => { console.log(game.player1.graveyard[1 - 1].name);await game.pause(); })()",
		);

		expect(await utilFunctions.parseEvalArgs(["log", "g#o#5.name"])).toEqual(
			"(async () => { console.log(game.player2.graveyard[5 - 1].name);await game.pause(); })()",
		);

		// UUID
		expect(await utilFunctions.parseEvalArgs(["log", "@ffffff.name"])).toEqual(
			'(async () => { let __card = Card.fromUUID("ffffff");if (!__card) throw new Error("Card with uuid \\"ffffff\\" not found");console.log(__card.name);await game.pause(); })()',
		);
	});
});
