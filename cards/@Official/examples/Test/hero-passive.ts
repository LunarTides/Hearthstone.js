// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Hero Passive Test",
	text: "<b>Your opponent can't use their hero power.</b>",
	cost: 1,
	type: Type.Hero,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f80-7001-b159-bd307f97d633",

	armor: 0,
	heropowerId: game.ids.Official.examples.heropower_example[0],

	async passive(self, owner, key, value, eventPlayer) {
		// Your opponent can't use their hero power.

		owner.getOpponent().disableHeroPower(self.uuid);
	},

	async remove(self, owner, key) {
		// Your opponent can't use their hero power.

		owner.getOpponent().enableHeroPower(self.uuid);
	},

	async test(self, owner) {
		const opponent = owner.getOpponent();
		opponent.mana = 10;

		assert.ok(opponent.canUseHeroPower());
		await owner.setHero(self, false);
		assert.ok(!opponent.canUseHeroPower());
		await owner.setToStartingHero();
		assert.ok(opponent.canUseHeroPower());
	},
};
