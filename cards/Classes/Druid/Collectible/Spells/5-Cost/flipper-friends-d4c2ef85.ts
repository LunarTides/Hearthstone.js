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
	id: "d4c2ef85-438a-4822-9872-6073a44b9a80",

	spellSchools: [SpellSchool.Nature],

	async cast(self, owner) {
		// Choose One - Summon a 6/6 Orca with Taunt; or six 1/1 Otters with Rush.
		await game.prompt.chooseOne(
			1,
			[
				"Summon a 6/6 Orca with <b>Taunt</b>",
				async () => {
					// Summon a 6/6 Orca with Taunt
					const orca = await Card.create(
						game.cardIds.orca_56c6c27a_e340_4fce_be4b_b93aa18ffdf3,
						owner,
					);
					await owner.summon(orca);
				},
			],
			[
				"Summon six 1/1 Otters with <b>Rush</b>",
				async () => {
					// Summon six 1/1 Otters with Rush
					for (let index = 0; index < 6; index++) {
						const otter = await Card.create(
							game.cardIds.otter_992de80a_5cde_4447_8d95_77c74d65183c,
							owner,
						);
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
			owner.board.filter(
				(card) =>
					card.id === game.cardIds.orca_56c6c27a_e340_4fce_be4b_b93aa18ffdf3,
			).length,
			1,
		);

		// Clear the board. Isn't really required in this case, but will cause buggy behavior if summoning more than 6 Otters.
		owner.board = [];

		// Summon six 1/1 Otters with Rush
		owner.inputQueue = ["2"];
		await self.trigger(Ability.Cast);

		// There should be 6 Otters on the board
		assert.equal(
			owner.board.filter(
				(card) =>
					card.id === game.cardIds.otter_992de80a_5cde_4447_8d95_77c74d65183c,
			).length,
			6,
		);
	},
};
