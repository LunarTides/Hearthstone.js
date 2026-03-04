import { color } from "@Game/modules/color.ts";
import { Rarity } from "@Game/types.ts";
import { describe, expect, test } from "bun:test";
import { stopTagParsing } from "chalk-tags";

describe("src/functions/color", () => {
	test("fromRarity", async () => {
		// Disable parsing tags so the output from `fromRarity` is easier to parse.
		stopTagParsing();

		expect(color.fromRarity("Test01", Rarity.Free)).toEqual("Test01");

		expect(color.fromRarity("Test02", Rarity.Common)).toEqual(
			"<gray>Test02</gray>",
		);

		expect(color.fromRarity("Test03", Rarity.Rare)).toEqual(
			"<blue>Test03</blue>",
		);

		expect(color.fromRarity("Test04", Rarity.Epic)).toEqual(
			"<bright:magenta>Test04</bright:magenta>",
		);

		expect(color.fromRarity("Test05", Rarity.Legendary)).toEqual(
			"<yellow>Test05</yellow>",
		);

		expect(color.fromRarity.bind("Test06", "invalid_rarity")).toThrow(
			"Unknown rarity",
		);
	});

	test("if", async () => {
		// Disable parsing tags so the output from `if` is easier to parse.
		stopTagParsing();

		expect(color.if(false, "red", "Test01")).toEqual("<gray>Test01</gray>");

		expect(color.if(true, "red", "Test02")).toEqual("<red>Test02</red>");
	});

	test("stripTags", async () => {
		expect(color.stripTags("No tags")).toEqual("No tags");

		expect(color.stripTags("<red>One normal tag</red>")).toEqual(
			"One normal tag",
		);

		expect(color.stripTags("~<red>Escaped tag~</red>")).toEqual(
			"<red>Escaped tag</red>",
		);

		expect(color.stripTags("~~<red>Double escaped tag~~</red>")).toEqual(
			"~<red>Double escaped tag~</red>",
		);
	});

	test("stripColors", async () => {
		expect(color.stripColors("No ansi codes")).toEqual("No ansi codes");

		expect(color.stripColors("\x1b[31;m1 ansi code\x1b[0m")).toEqual(
			"1 ansi code",
		);

		expect(color.stripColors("\x1b[31;1;4m3 ansi codes\x1b[0m")).toEqual(
			"3 ansi codes",
		);
	});

	test("stripAll", async () => {
		expect(color.stripAll("No tags or ansi codes")).toEqual(
			"No tags or ansi codes",
		);

		// Tags
		expect(color.stripAll("<red>One normal tag</red>")).toEqual(
			"One normal tag",
		);

		expect(color.stripAll("~<red>Escaped tag~</red>")).toEqual(
			"<red>Escaped tag</red>",
		);

		expect(color.stripAll("~~<red>Double escaped tag~~</red>")).toEqual(
			"~<red>Double escaped tag~</red>",
		);

		// Ansi codes
		expect(color.stripAll("\x1b[31;m1 ansi code\x1b[0m")).toEqual(
			"1 ansi code",
		);

		expect(color.stripAll("\x1b[31;1;4m3 ansi codes\x1b[0m")).toEqual(
			"3 ansi codes",
		);

		// Tags & Ansi codes
		expect(
			color.stripAll(
				"\x1b[31;m<red>One normal tag and one ansi code</red>\x1b[0m",
			),
		).toEqual("One normal tag and one ansi code");
	});
});
