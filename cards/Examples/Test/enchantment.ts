// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	EnchantmentPriority,
	EventListenerMessage,
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
	id: "019bc665-4f7f-7012-a8c3-818e01ca1c52",

	enchantmentPriority: EnchantmentPriority.Normal,

	async enchantmentApply(self, owner, host) {
		await host.addStats(1, 2);
	},

	async enchantmentRemove(self, owner, host) {
		await host.removeStats(1, 2);
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};
