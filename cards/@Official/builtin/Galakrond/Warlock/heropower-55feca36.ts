// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Galakrond's Malice",
	text: "Summon two 1/1 Imps.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.Warlock],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [],
	id: "019bc665-4f80-7021-896a-55feca3670b0",

	async heropower(self, owner) {
		// Summon two 1/1 Imps.
		for (let i = 0; i < 2; i++) {
			const card = await Card.create(
				game.ids.Official.builtin.draconic_imp[0],
				owner,
			);
			if (!card) {
				break;
			}

			await owner.summon(card);
		}
	},

	async test(self, owner) {
		const countImps = () =>
			owner.board.filter(
				(card) => card.id === game.ids.Official.builtin.draconic_imp[0],
			).length;

		// There should be 0 imps by default
		assert.equal(countImps(), 0);

		// There should be 2 imps when using the hero power
		await self.trigger(Ability.HeroPower);
		assert.equal(countImps(), 2);
	},
};
