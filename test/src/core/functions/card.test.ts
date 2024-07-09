import { describe, expect, test } from "bun:test";
import { cardFunctions } from "@Game/internal.js";

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
		expect(cardFunctions.validateClasses(["Mage"], "Druid")).toEqual(false);
		expect(cardFunctions.validateClasses(["Mage"], "Mage")).toEqual(true);
		expect(cardFunctions.validateClasses(["Mage", "Druid"], "Druid")).toEqual(
			true,
		);
		expect(cardFunctions.validateClasses(["Neutral"], "Druid")).toEqual(true);
	});

	test("matchTribe", async () => {
		expect(cardFunctions.matchTribe("Beast", "Demon")).toEqual(false);
		expect(cardFunctions.matchTribe("Beast", "Beast")).toEqual(true);
		expect(cardFunctions.matchTribe("All", "Beast")).toEqual(true);
		// TODO: Should this return true?
		expect(cardFunctions.matchTribe("Beast", "All")).toEqual(false);
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
});
