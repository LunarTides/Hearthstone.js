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
	name: "Flipper Friends",
	text: "<b>Choose One</b> - Summon a 6/6 Orca with <b>Taunt</b>; or six 1/1 Otters with <b>Rush</b>.",
	cost: 5,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Common,
	collectible: true,
	tags: [],
	id: 97,

	spellSchools: [SpellSchool.Nature],

	async cast(self, owner) {
		// Choose One - Summon a 6/6 Orca with Taunt; or six 1/1 Otters with Rush.
		await game.functions.interact.prompt.chooseOne(
			1,
			[
				"Summon a 6/6 Orca with <b>Taunt</b>",
				async () => {
					// Summon a 6/6 Orca with Taunt
					const orca = await Card.create(game.cardIds.orca_96, owner);
					await owner.summon(orca);
				},
			],
			[
				"Summon six 1/1 Otters with <b>Rush</b>",
				async () => {
					// Summon six 1/1 Otters with Rush
					for (let index = 0; index < 6; index++) {
						const otter = await Card.create(game.cardIds.otter_95, owner);
						await owner.summon(otter);
					}
				},
			],
		);
	},

	async test(self, owner) {
		// Summon a 6/6 Orca with Taunt
		owner.inputQueue = ["1"];
		await self.trigger(Ability.Cast);

		// There should be 1 Orca on the board
		assert.equal(
			owner.board.filter((card) => card.id === game.cardIds.orca_96).length,
			1,
		);

		// Clear the board. Isn't really required in this case, but will cause buggy behavior if summoning more than 6 Otters.
		owner.board = [];

		// Summon six 1/1 Otters with Rush
		owner.inputQueue = ["2"];
		await self.trigger(Ability.Cast);

		// There should be 6 Otters on the board
		assert.equal(
			owner.board.filter((card) => card.id === game.cardIds.otter_95).length,
			6,
		);
	},
};
