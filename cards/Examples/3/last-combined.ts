// Created by Hand

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
	name: "Combined Example 3",

	/*
	 * This is less complicated than it looks.
	 * The actual complicated stuff is delaying *code* until certain conditions are met.
	 */
	text: "If the turn counter is an even number, gain mana equal to the turn counter (up to 10). Manathirst (7): Remove the condition. (Currently: {turns})",

	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: 54,

	spellSchools: [SpellSchool.None],

	async cast(owner, self) {
		if (!(await self.condition())) {
			return;
		}

		// If the turn counter is an even number, gain mana equal to the turn counter (up to 10).
		let turns = game.functions.util.getTraditionalTurnCounter();

		// Cap the turn counter at 10
		if (turns > 10) {
			turns = 10;
		}

		owner.addMana(turns);
	},

	async condition(owner, self) {
		let turns = game.functions.util.getTraditionalTurnCounter();
		if (turns > 10) {
			turns = 10;
		}

		// Check if the turn counter is an even number.
		const even = turns % 2 === 0;
		const manathirst = self.manathirst(7);

		// If the turn counter is an even number or the manathirst is fullfilled, clear the condition.
		return even || manathirst;
	},

	async placeholders(owner, self) {
		let turns = game.functions.util.getTraditionalTurnCounter();
		if (turns > 10) {
			turns = 10;
		}

		return { turns };
	},

	async test(owner, self) {
		const turn = () => {
			let turns = game.functions.util.getTraditionalTurnCounter();
			if (turns > 10) {
				turns = 10;
			}

			return turns;
		};

		// The condition is not cleared
		let { mana } = owner;
		assert.equal(turn(), 1);
		await self.trigger(Ability.Cast);

		assert.equal(owner.mana, mana);

		// Next
		await game.endTurn();
		await game.endTurn();

		// The condition is cleared, gain 2 mana.
		mana = owner.mana;
		assert.equal(turn(), 2);
		await self.trigger(Ability.Cast);

		assert.equal(owner.mana, mana + 2);

		// Next
		await game.endTurn();
		await game.endTurn();

		// The manathirst is cleared, but not the condition, still gain 3 mana.
		owner.emptyMana = 7;
		mana = owner.mana;
		assert.equal(turn(), 3);
		await self.trigger(Ability.Cast);

		assert.equal(owner.mana, mana + 3);
	},
};
