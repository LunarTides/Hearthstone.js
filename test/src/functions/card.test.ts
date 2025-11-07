import { cardFunctions } from "@Game/functions/card.ts";
import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";
import { describe, expect, test } from "bun:test";

describe("src/functions/card", () => {
	test.todo("vanilla > getAll", async () => {});
	test.todo("vanilla > filter", async () => {});

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
			cardFunctions.matchTribe([MinionTribe.Beast], MinionTribe.Demon),
		).toEqual(false);
		expect(
			cardFunctions.matchTribe([MinionTribe.Beast], MinionTribe.Beast),
		).toEqual(true);
		expect(
			cardFunctions.matchTribe([MinionTribe.All], MinionTribe.Beast),
		).toEqual(true);
		expect(
			cardFunctions.matchTribe([MinionTribe.Beast], MinionTribe.All),
		).toEqual(true);
	});

	test.todo("runBlueprintValidator", async () => {});
	test.todo("getClasses", async () => {});

	test("galakrondFormula", async () => {
		expect(cardFunctions.galakrondFormula(0)).toEqual(1);
		expect(cardFunctions.galakrondFormula(1)).toEqual(1);
		expect(cardFunctions.galakrondFormula(2)).toEqual(2);
		expect(cardFunctions.galakrondFormula(3)).toEqual(2);
		expect(cardFunctions.galakrondFormula(4)).toEqual(4);
		expect(cardFunctions.galakrondFormula(5)).toEqual(4);
		expect(cardFunctions.galakrondFormula(6)).toEqual(4);
	});

	test("validateBlueprint", async () => {
		let card: Blueprint = {
			name: "Sheep",
			text: "",
			cost: 1,
			type: Type.Minion,
			classes: [Class.Neutral],
			rarity: Rarity.Free,
			collectible: false,
			tags: [],
			id: 1,
		};

		const reset = (type: Type) => {
			card = {
				name: "Sheep",
				text: "",
				cost: 1,
				type,
				classes: [Class.Neutral],
				rarity: Rarity.Free,
				collectible: false,
				tags: [],
				id: 1,
			};
		};

		// Minion
		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'tribes' DOES NOT</bold> exist for that card.",
		);
		card.tribes = [MinionTribe.Beast];

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'health' DOES NOT</bold> exist for that card.",
		);
		card.health = 1;

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'attack' DOES NOT</bold> exist for that card.",
		);
		card.attack = 1;

		expect(cardFunctions.validateBlueprint(card)).toEqual(true);

		card.spellSchools = [SpellSchool.Nature];
		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'spellSchools' SHOULD NOT</bold> exist on card type Minion.",
		);

		// Spell
		reset(Type.Spell);

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'spellSchools' DOES NOT</bold> exist for that card.",
		);
		card.spellSchools = [SpellSchool.Nature];

		expect(cardFunctions.validateBlueprint(card)).toEqual(true);

		card.attack = 1;
		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'attack' SHOULD NOT</bold> exist on card type Spell.",
		);

		// Weapon
		reset(Type.Weapon);

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'health' DOES NOT</bold> exist for that card.",
		);
		card.health = 1;

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'attack' DOES NOT</bold> exist for that card.",
		);
		card.attack = 1;

		expect(cardFunctions.validateBlueprint(card)).toEqual(true);

		card.spellSchools = [SpellSchool.Nature];
		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'spellSchools' SHOULD NOT</bold> exist on card type Weapon.",
		);

		// Hero
		reset(Type.Hero);

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'heropowerId' DOES NOT</bold> exist for that card.",
		);
		card.heropowerId = 1;

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'armor' DOES NOT</bold> exist for that card.",
		);
		card.armor = 1;

		expect(cardFunctions.validateBlueprint(card)).toEqual(true);

		card.attack = 1;
		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'attack' SHOULD NOT</bold> exist on card type Hero.",
		);

		// Location
		reset(Type.Location);

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'cooldown' DOES NOT</bold> exist for that card.",
		);
		card.cooldown = 1;

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'durability' DOES NOT</bold> exist for that card.",
		);
		card.durability = 1;

		expect(cardFunctions.validateBlueprint(card)).toEqual(true);

		card.attack = 1;
		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'attack' SHOULD NOT</bold> exist on card type Location.",
		);

		// Hero Power
		reset(Type.HeroPower);

		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'heropower' DOES NOT</bold> exist for that card.",
		);
		card.heropower = async () => {};

		expect(cardFunctions.validateBlueprint(card)).toEqual(true);

		card.attack = 1;
		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'attack' SHOULD NOT</bold> exist on card type HeroPower.",
		);

		// Undefined
		reset(Type.Undefined);

		expect(cardFunctions.validateBlueprint(card)).toEqual(true);

		card.attack = 1;
		expect(cardFunctions.validateBlueprint(card)).toEqual(
			"<bold>'attack' SHOULD NOT</bold> exist on card type Undefined.",
		);
	});

	test.todo("generateIdsFile", async () => {});
	test.todo("verifyDiySolution", async () => {});
});
