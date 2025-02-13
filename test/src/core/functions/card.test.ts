import { describe, expect, test } from "bun:test";
import { cardFunctions } from "@Core/functions/card.js";
import { Class, MinionTribe } from "@Game/types.js";

/*
 * Need to create a game in case the functions need it
 * This is a pretty big performance hit.
 */
// createGame();

describe("src/core/functions/card", () => {
	test.todo("vanilla > getAll", async () => {
		expect(false).toEqual(true);
	});

	test.todo("vanilla > filter", async () => {
		expect(false).toEqual(true);
	});

	test("validateClasses", async () => {
		expect(cardFunctions.validateClasses([Class.Mage], Class.Druid)).toEqual(
			false,
		);
		expect(cardFunctions.validateClasses([Class.Mage], Class.Mage)).toEqual(
			true,
		);
		expect(
			cardFunctions.validateClasses([Class.Mage, Class.Druid], Class.Druid),
		).toEqual(true);
		expect(cardFunctions.validateClasses([Class.Neutral], Class.Druid)).toEqual(
			true,
		);
	});

	test("matchTribe", async () => {
		expect(
			cardFunctions.matchTribe(MinionTribe.Beast, MinionTribe.Demon),
		).toEqual(false);
		expect(
			cardFunctions.matchTribe(MinionTribe.Beast, MinionTribe.Beast),
		).toEqual(true);
		expect(
			cardFunctions.matchTribe(MinionTribe.All, MinionTribe.Beast),
		).toEqual(true);
		expect(
			cardFunctions.matchTribe(MinionTribe.Beast, MinionTribe.All),
		).toEqual(true);
	});

	test.todo("runBlueprintValidator", async () => {
		expect(false).toEqual(true);
	});

	test.todo("getClasses", async () => {
		expect(false).toEqual(true);
	});

	test("galakrondFormula", async () => {
		expect(cardFunctions.galakrondFormula(0)).toEqual(1);
		expect(cardFunctions.galakrondFormula(1)).toEqual(1);
		expect(cardFunctions.galakrondFormula(2)).toEqual(2);
		expect(cardFunctions.galakrondFormula(3)).toEqual(2);
		expect(cardFunctions.galakrondFormula(4)).toEqual(4);
		expect(cardFunctions.galakrondFormula(5)).toEqual(4);
		expect(cardFunctions.galakrondFormula(6)).toEqual(4);
	});

	test.todo("validateBlueprint", async () => {
		expect(false).toEqual(true);
	});

	test.todo("generateIdsFile", async () => {
		expect(false).toEqual(true);
	});

	test.todo("verifyDiySolution", async () => {
		expect(false).toEqual(true);
	});
});
