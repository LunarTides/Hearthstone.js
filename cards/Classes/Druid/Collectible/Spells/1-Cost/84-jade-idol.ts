// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Player } from "@Game/internal.js";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Jade Idol",
	text: "<b>Choose One -</b> Summon a <b>Jade Golem</b>; or Shuffle 3 copies of this card into your deck.",
	cost: 1,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Rare",
	collectible: true,
	id: 84,

	spellSchool: "None",

	cast(owner, self) {
		// Choose One - Summon a Jade Golem; or Shuffle 3 copies of this card into your deck.
		game.interact.chooseOne(
			1,
			[
				"Summon a Jade Golem",
				() => {
					// Summon a Jade Golem
					const jade = owner.createJade();
					owner.summon(jade);
				},
			],
			[
				"Shuffle 3 copies of this card into your deck",
				() => {
					// Shuffle
					for (let i = 0; i < 3; i++) {
						owner.shuffleIntoDeck(self.imperfectCopy());
					}
				},
			],
		);
	},

	test(owner, self) {
		// Summon a Jade Golem
		owner.inputQueue = ["1"];
		self.activate("cast");

		// There should be a jade golem
		assert.ok(owner.board.some((card) => card.id === game.cardIds.jadeGolem85));

		// Shuffle 3 copies
		owner.inputQueue = ["2"];
		self.activate("cast");

		// There should be 3 copies of this card in the player's deck
		assert.equal(owner.deck.filter((card) => card.id === self.id).length, 3);
	},
};
