// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Scale of Onyxia",
	text: "Fill your board with 2/1 Whelps with <b>Rush</b>.",
	cost: 7,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Common,
	collectible: true,
	tags: [],
	id: 100,

	spellSchools: [SpellSchool.None],

	async cast(owner, self) {
		// Fill your board with 2/1 Whelps with Rush.
		const remainingBoardSpace = owner.getRemainingBoardSpace();

		for (let index = 0; index < remainingBoardSpace; index++) {
			const whelp = await Card.create(game.cardIds.onyxianWhelp99, owner);
			await owner.summon(whelp);
		}
	},

	async test(owner, self) {
		assert.equal(owner.board.length, 0);
		await self.trigger(Ability.Cast);

		// Check if the board has been filled
		assert.equal(owner.board.length, game.config.general.maxBoardSpace);

		// Check if every card on the board is a whelp
		assert.ok(
			owner.board.every((card) => card.id === game.cardIds.onyxianWhelp99),
		);
	},
};
