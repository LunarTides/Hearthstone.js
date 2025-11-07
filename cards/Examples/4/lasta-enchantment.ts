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
	name: "Combined Example 4 Enchantment",
	text: "This card costs (1) less.",
	cost: 0,
	type: Type.Enchantment,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 147,

	enchantmentPriority: EnchantmentPriority.High,

	async enchantmentApply(self, owner, host) {
		// This card costs (1) less.
		host.cost -= 1;
	},

	async enchantmentRemove(self, owner, host) {
		// This card costs (1) less.
		host.cost += 1;
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};
