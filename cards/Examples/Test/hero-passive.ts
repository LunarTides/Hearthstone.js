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
	id: "9c0cd911-390b-4988-8d01-a6597492c5e6",

	armor: 0,
	heropowerId:
		game.cardIds.heropowerExample_d2ab1def_46dc_407f_8b82_ba347afb63ee,

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
