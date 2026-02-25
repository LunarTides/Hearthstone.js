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

// TODO: Sometimes, the whelps don't take damage when attacking.
export const blueprint: Blueprint = {
	name: "Scale of Onyxia",
	text: "Fill your board with 2/1 Whelps with <b>Rush</b>.",
	cost: 7,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Common,
	collectible: true,
	tags: [],
	id: "019bc665-4f82-7006-983a-32af51cb4013",

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Fill your board with 2/1 Whelps with Rush.
		const remainingBoardSpace = owner.getRemainingBoardSpace();

		for (let index = 0; index < remainingBoardSpace; index++) {
			const whelp = await Card.create(
				game.ids.Official.card_pack_1.onyxian_whelp[0],
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
				(card) => card.id === game.ids.Official.card_pack_1.onyxian_whelp[0],
			),
		);
	},
};
