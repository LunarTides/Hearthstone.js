// Created by the Vanilla Card Creator

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
	name: "Jade Idol",
	text: "<b>Choose One -</b> Summon a <b>Jade Golem</b>; or Shuffle 3 copies of this card into your deck.",
	cost: 1,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Rare,
	collectible: true,
	tags: [],
	id: "2f0b7c27-b85e-4b7e-9cf6-a9ea0faff2c2",

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Choose One - Summon a Jade Golem; or Shuffle 3 copies of this card into your deck.
		await game.prompt.chooseOne(
			1,
			[
				"Summon a Jade Golem",
				async () => {
					// Summon a Jade Golem
					const jade = await owner.createJade();
					await owner.summon(jade);
				},
			],
			[
				"Shuffle 3 copies of this card into your deck",
				async () => {
					// Shuffle
					for (let i = 0; i < 3; i++) {
						await owner.shuffleIntoDeck(await self.imperfectCopy());
					}
				},
			],
		);
	},

	async test(self, owner) {
		// Summon a Jade Golem
		owner.inputQueue = ["1"];
		await self.trigger(Ability.Cast);

		// There should be a jade golem
		assert.ok(
			owner.board.some(
				(card) =>
					card.id ===
					game.cardIds.jadeGolem_cf300193_f06d_4a16_ae3d_0c3b03781b20,
			),
		);

		// Shuffle 3 copies
		owner.inputQueue = ["2"];
		await self.trigger(Ability.Cast);

		// There should be 3 copies of this card in the player's deck
		assert.equal(owner.deck.filter((card) => card.id === self.id).length, 3);
	},
};
