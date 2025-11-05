// Created by the Custom Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	EnchantmentPriority,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Enchantment Test",
	text: "<b>+1 Attack. +2 Health</b>",
	cost: 0,
	type: Type.Enchantment,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 142,

	enchantmentPriority: EnchantmentPriority.Normal,

	async enchantmentApply(self, owner, host) {
		await host.addStats(1, 2);
	},

	async enchantmentRemove(self, owner, host) {
		await host.removeStats(1, 2);
	},

	async test(owner, self) {
		assert.fail();
	},
};
