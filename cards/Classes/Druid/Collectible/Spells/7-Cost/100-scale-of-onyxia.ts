// Created by the Vanilla Card Creator

import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Scale of Onyxia",
	text: "Fill your board with 2/1 Whelps with <b>Rush</b>.",
	cost: 7,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Common,
	collectible: true,
	tags: [],
	id: "d6582680-eec2-4796-be1f-244b7a15d273",

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Fill your board with 2/1 Whelps with Rush.
		const remainingBoardSpace = owner.getRemainingBoardSpace();

		for (let index = 0; index < remainingBoardSpace; index++) {
			const whelp = await Card.create(
				game.cardIds.onyxianWhelp_0875f676_82a3_4b99_b30c_aae1f34cc686,
				owner,
			);
			await owner.summon(whelp);
		}
	},

	async test(self, owner) {
		assert.equal(owner.board.length, 0);
		await self.trigger(Ability.Cast);

		// Check if the board has been filled
		assert.equal(owner.board.length, game.config.general.maxBoardSpace);

		// Check if every card on the board is a whelp
		assert.ok(
			owner.board.every(
				(card) =>
					card.id ===
					game.cardIds.onyxianWhelp_0875f676_82a3_4b99_b30c_aae1f34cc686,
			),
		);
	},
};
