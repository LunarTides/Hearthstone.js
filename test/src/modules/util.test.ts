import { util } from "@Game/modules/util.ts";
import { describe, expect, test } from "bun:test";

describe("src/functions/util", () => {
	test("remove", async () => {
		const list = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];

		util.remove(list, 3);

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

		const alignedColumns = util.alignColumns(columns, "-");

		expect(alignedColumns).toEqual([
			"Example             - Example",
			"Test                - Hello World",
			"This is the longest - Short",
			"Tiny                - This is even longer then that one!",
		]);
	});

	test.todo("importConfig", async () => {});
	test.todo("createLogFile", async () => {});
	test.todo("parseLogFile", async () => {});

	test("runCommand", async () => {
		/*
		 * Bun is the only program that is guaranteed to be installed
		 * We shouldn't count on other programs / commands being installed here
		 */
		const command = "bun --version";
		const result = util.runCommand(command);

		expect(result).toStartWith(Bun.version);
	});

	test.todo("openInBrowser", async () => {});

	test("getTraditionalTurnCounter", async () => {
		/*
		 * Game.turn will be set to 1 when starting the game,
		 * but since the game has not started yet, it will be 0
		 * We can't start the game since it would immediately end the game again
		 * since a player would die in the starting phase
		 */
		game.turn = 1;

		let counter = util.getTraditionalTurnCounter();
		expect(counter).toEqual(1);

		await game.endTurn();
		await game.endTurn();

		// Turn starts at 1, every `game.endTurn` increments it by 1, 1 + 2 = 3
		expect(game.turn).toEqual(3);

		counter = util.getTraditionalTurnCounter();
		expect(counter).toEqual(2);
	});

	test.todo("getCachedLanguageMap", async () => {});
	test.todo("importLanguageMap", async () => {});
	test.todo("fs", async () => {});
	test.todo("searchFolder", async () => {});
	test.todo("searchCardsFolder", async () => {});

	test("restrictPath", async () => {
		const match = (path: string) => {
			expect(util.restrictPath(path)).toEqual(`${util.dirname()}/cards/`);
		};

		// All of these should resolve to "(Path to the folder where hearthstone.js is stored)/Hearthstone.js/cards/"
		match("/cards/");
		match("~/cards/");
		match("./cards/");
		match("cards/");
		match(`${util.dirname()}/cards/`);

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

	test.todo("dirname", async () => {});
	test.todo("getRandomTarget", async () => {});
	test.todo("getRandomTargetRelative", async () => {});
	test.todo("setupTimeEvents", async () => {});
	test.todo("getCurrentEventEmojis", async () => {});

	test("parseEvalArgs", async () => {
		expect(await util.parseEvalArgs(["console.log('Hello World')"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log('Hello World')\n})();",
		);

		expect(await util.parseEvalArgs(["log", '"Hello World"'])).toEqual(
			'(async () => {\n\t// Code\n\tconsole.log("Hello World");\n\tawait game.pause();\n})();',
		);

		expect(
			await util.parseEvalArgs([
				"log",
				"await",
				"game.util.parseEvalArgs([\"console.log('hi')\"])",
			]),
		).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(await game.util.parseEvalArgs([\"console.log('hi')\"]));\n\tawait game.pause();\n})();",
		);

		// @
		expect(await util.parseEvalArgs(["log", "@Player1.getName()"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player1.getName());\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "@Player2.getName()"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player2.getName());\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "@Player.getName()"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.getName());\n\tawait game.pause();\n})();",
		);

		// Location codes
		expect(await util.parseEvalArgs(["log", "#ph1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.hand[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "#ch2.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.hand[2 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "#oh1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.opponent.hand[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "#pd1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.deck[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "#od2.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.opponent.deck[2 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "#pb1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.board[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "#ob5.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.opponent.board[5 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "#pg1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.graveyard[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await util.parseEvalArgs(["log", "#og5.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.opponent.graveyard[5 - 1].name);\n\tawait game.pause();\n})();",
		);

		// UUID
		expect(await util.parseEvalArgs(["log", "@ffffff.name"])).toEqual(
			'(async () => {\n\t// Variables\n\tconst __card_ffffff = Card.fromUUID("ffffff");\n\tif (!__card_ffffff) throw new Error("Card with uuid \\"ffffff\\" not found");\n\n\t// Code\n\tconsole.log(__card_ffffff.name);\n\tawait game.pause();\n})();',
		);

		expect(
			await util.parseEvalArgs(["log", "await", "@ffffff.readable()"]),
		).toEqual(
			'(async () => {\n\t// Variables\n\tconst __card_ffffff = Card.fromUUID("ffffff");\n\tif (!__card_ffffff) throw new Error("Card with uuid \\"ffffff\\" not found");\n\n\t// Code\n\tconsole.log(await __card_ffffff.readable());\n\tawait game.pause();\n})();',
		);

		expect(
			await util.parseEvalArgs([
				"await",
				// biome-ignore lint/suspicious/noTemplateCurlyInString: testing code generation
				"game.pause(`${@abcdefg.uuid} ||| ${@1234567.uuid}`)",
			]),
		).toEqual(
			// biome-ignore lint/suspicious/noTemplateCurlyInString: testing code generation
			'(async () => {\n\t// Variables\n\tconst __card_abcdefg = Card.fromUUID("abcdefg");\n\tif (!__card_abcdefg) throw new Error("Card with uuid \\"abcdefg\\" not found");\n\tconst __card_1234567 = Card.fromUUID("1234567");\n\tif (!__card_1234567) throw new Error("Card with uuid \\"1234567\\" not found");\n\n\t// Code\n\tawait game.pause(`${__card_abcdefg.uuid} ||| ${__card_1234567.uuid}`)\n})();',
		);
	});
});
