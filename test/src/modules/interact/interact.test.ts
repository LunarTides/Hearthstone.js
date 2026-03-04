import { interact } from "@Game/modules/interact/index.ts";
import { describe, expect, test } from "bun:test";

describe("src/functions/interact", () => {
	test.todo("isInputExit", async () => {});
	test.todo("cls", async () => {});
	test.todo("withStatus", async () => {});
	test.todo("input", async () => {});
	test.todo("log", async () => {});
	test.todo("logError", async () => {});
	test.todo("logWarn", async () => {});

	test("parseEvalArgs", async () => {
		expect(
			await interact.parseEvalArgs(["console.log('Hello World')"]),
		).toEqual("(async () => {\n\t// Code\n\tconsole.log('Hello World')\n})();");

		expect(await interact.parseEvalArgs(["log", '"Hello World"'])).toEqual(
			'(async () => {\n\t// Code\n\tconsole.log("Hello World");\n\tawait game.pause();\n})();',
		);

		expect(
			await interact.parseEvalArgs([
				"log",
				"await",
				"game.interact.parseEvalArgs([\"console.log('hi')\"])",
			]),
		).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(await game.interact.parseEvalArgs([\"console.log('hi')\"]));\n\tawait game.pause();\n})();",
		);

		// @
		expect(await interact.parseEvalArgs(["log", "@Player1.getName()"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player1.getName());\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "@Player2.getName()"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player2.getName());\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "@Player.getName()"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.getName());\n\tawait game.pause();\n})();",
		);

		// Location codes
		expect(await interact.parseEvalArgs(["log", "#ph1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.hand[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "#ch2.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.hand[2 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "#oh1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.opponent.hand[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "#pd1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.deck[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "#od2.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.opponent.deck[2 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "#pb1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.board[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "#ob5.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.opponent.board[5 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "#pg1.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.player.graveyard[1 - 1].name);\n\tawait game.pause();\n})();",
		);

		expect(await interact.parseEvalArgs(["log", "#og5.name"])).toEqual(
			"(async () => {\n\t// Code\n\tconsole.log(game.opponent.graveyard[5 - 1].name);\n\tawait game.pause();\n})();",
		);

		// UUID
		expect(await interact.parseEvalArgs(["log", "@ffffff.name"])).toEqual(
			'(async () => {\n\t// Variables\n\tconst __card_ffffff = Card.fromUUID("ffffff");\n\tif (!__card_ffffff) throw new Error("Card with uuid \\"ffffff\\" not found");\n\n\t// Code\n\tconsole.log(__card_ffffff.name);\n\tawait game.pause();\n})();',
		);

		expect(
			await interact.parseEvalArgs(["log", "await", "@ffffff.readable()"]),
		).toEqual(
			'(async () => {\n\t// Variables\n\tconst __card_ffffff = Card.fromUUID("ffffff");\n\tif (!__card_ffffff) throw new Error("Card with uuid \\"ffffff\\" not found");\n\n\t// Code\n\tconsole.log(await __card_ffffff.readable());\n\tawait game.pause();\n})();',
		);

		expect(
			await interact.parseEvalArgs([
				"await",
				// biome-ignore lint/suspicious/noTemplateCurlyInString: testing code generation
				"game.pause(`${@abcdefg.uuid} ||| ${@1234567.uuid}`)",
			]),
		).toEqual(
			// biome-ignore lint/suspicious/noTemplateCurlyInString: testing code generation
			'(async () => {\n\t// Variables\n\tconst __card_abcdefg = Card.fromUUID("abcdefg");\n\tif (!__card_abcdefg) throw new Error("Card with uuid \\"abcdefg\\" not found");\n\tconst __card_1234567 = Card.fromUUID("1234567");\n\tif (!__card_1234567) throw new Error("Card with uuid \\"1234567\\" not found");\n\n\t// Code\n\tawait game.pause(`${__card_abcdefg.uuid} ||| ${__card_1234567.uuid}`)\n})();',
		);
	});

	test.todo("processCommand", async () => {});
	test.todo("gameloop", async () => {});
});
