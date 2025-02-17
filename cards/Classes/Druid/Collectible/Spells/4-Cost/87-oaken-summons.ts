// Created by the Vanilla Card Creator

import assert from "node:assert";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Oaken Summons",
	text: "Gain 6 Armor. <b>Recruit</b> a minion that costs (4) or less.",
	cost: 4,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Common,
	collectible: true,
	tags: [],
	id: 87,

	spellSchools: [SpellSchool.Nature],

	async cast(owner, self) {
		// Gain 6 Armor. Recruit a minion that costs (4) or less.
		owner.addArmor(6);
		await owner.recruit(owner.deck, 1, (card) => card.cost <= 4);
	},

	async test(owner, self) {
		for (let index = 1; index <= 10; index++) {
			await self.activate(Ability.Cast);

			// Check if the armor is correct
			assert.equal(owner.armor, 6 * index);

			// Check if there exists a minion on the board that costs 4 or less
			assert.ok(
				owner.board.some(
					(card) =>
						card.cost <= 4 &&
						card.type === Type.Minion &&
						card.uuid !== self.uuid,
				),
			);

			// Clear the board
			owner.board = [];
		}
	},
};
