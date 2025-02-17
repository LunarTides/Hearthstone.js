import { describe, expect, test } from "bun:test";
import { colorFunctions } from "@Game/functions/color.js";
import { createGame } from "@Game/game.js";
import { Rarity } from "@Game/types.js";
import { stopTagParsing } from "chalk-tags";

/*
 * Need to create a game in case the functions need it
 * This is a pretty big performance hit.
 */
createGame();

describe("src/core/functions/color", () => {
	test("fromRarity", async () => {
		// Disable parsing tags so the output from `fromRarity` is easier to parse.
		stopTagParsing();

		expect(colorFunctions.fromRarity("Test01", Rarity.Free)).toEqual("Test01");

		expect(colorFunctions.fromRarity("Test02", Rarity.Common)).toEqual(
			"<gray>Test02</gray>",
		);

		expect(colorFunctions.fromRarity("Test03", Rarity.Rare)).toEqual(
			"<blue>Test03</blue>",
		);

		expect(colorFunctions.fromRarity("Test04", Rarity.Epic)).toEqual(
			"<bright:magenta>Test04</bright:magenta>",
		);

		expect(colorFunctions.fromRarity("Test05", Rarity.Legendary)).toEqual(
			"<yellow>Test05</yellow>",
		);

		expect(colorFunctions.fromRarity.bind("Test06", "invalid_rarity")).toThrow(
			"Unknown rarity",
		);
	});

	test("if", async () => {
		// Disable parsing tags so the output from `if` is easier to parse.
		stopTagParsing();

		expect(colorFunctions.if(false, "red", "Test01")).toEqual(
			"<gray>Test01</gray>",
		);

		expect(colorFunctions.if(true, "red", "Test02")).toEqual(
			"<red>Test02</red>",
		);
	});

	test("stripTags", async () => {
		expect(colorFunctions.stripTags("No tags")).toEqual("No tags");

		expect(colorFunctions.stripTags("<red>One normal tag</red>")).toEqual(
			"One normal tag",
		);

		expect(colorFunctions.stripTags("~<red>Escaped tag~</red>")).toEqual(
			"<red>Escaped tag</red>",
		);

		expect(
			colorFunctions.stripTags("~~<red>Double escaped tag~~</red>"),
		).toEqual("~<red>Double escaped tag~</red>");
	});

	test("stripColors", async () => {
		expect(colorFunctions.stripColors("No ansi codes")).toEqual(
			"No ansi codes",
		);

		expect(colorFunctions.stripColors("\x1b[31;m1 ansi code\x1b[0m")).toEqual(
			"1 ansi code",
		);

		expect(
			colorFunctions.stripColors("\x1b[31;1;4m3 ansi codes\x1b[0m"),
		).toEqual("3 ansi codes");
	});

	test("stripAll", async () => {
		expect(colorFunctions.stripAll("No tags or ansi codes")).toEqual(
			"No tags or ansi codes",
		);

		// Tags
		expect(colorFunctions.stripAll("<red>One normal tag</red>")).toEqual(
			"One normal tag",
		);

		expect(colorFunctions.stripAll("~<red>Escaped tag~</red>")).toEqual(
			"<red>Escaped tag</red>",
		);

		expect(
			colorFunctions.stripAll("~~<red>Double escaped tag~~</red>"),
		).toEqual("~<red>Double escaped tag~</red>");

		// Ansi codes
		expect(colorFunctions.stripAll("\x1b[31;m1 ansi code\x1b[0m")).toEqual(
			"1 ansi code",
		);

		expect(colorFunctions.stripAll("\x1b[31;1;4m3 ansi codes\x1b[0m")).toEqual(
			"3 ansi codes",
		);

		// Tags & Ansi codes
		expect(
			colorFunctions.stripAll(
				"\x1b[31;m<red>One normal tag and one ansi code</red>\x1b[0m",
			),
		).toEqual("One normal tag and one ansi code");
	});
});
