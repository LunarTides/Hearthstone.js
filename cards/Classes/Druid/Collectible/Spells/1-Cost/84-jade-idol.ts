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
	name: "Jade Idol",
	text: "<b>Choose One -</b> Summon a <b>Jade Golem</b>; or Shuffle 3 copies of this card into your deck.",
	cost: 1,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Rare,
	collectible: true,
	tags: [],
	id: 84,

	spellSchool: SpellSchool.None,

	async cast(owner, self) {
		// Choose One - Summon a Jade Golem; or Shuffle 3 copies of this card into your deck.
		await game.functions.interact.prompt.chooseOne(
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

	async test(owner, self) {
		// Summon a Jade Golem
		owner.inputQueue = ["1"];
		await self.activate(Ability.Cast);

		// There should be a jade golem
		assert.ok(owner.board.some((card) => card.id === game.cardIds.jadeGolem85));

		// Shuffle 3 copies
		owner.inputQueue = ["2"];
		await self.activate(Ability.Cast);

		// There should be 3 copies of this card in the player's deck
		assert.equal(owner.deck.filter((card) => card.id === self.id).length, 3);
	},
};
