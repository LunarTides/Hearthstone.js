// Created by the Custom Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	EnchantmentPriority,
	EventListenerMessage,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	// TODO: This isn't the actual name and text, but I don't know what is...
	name: "Fate's Blessing",
	text: "This card costs (0) mana.",
	cost: 0,
	type: Type.Enchantment,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 144,

	enchantmentPriority: EnchantmentPriority.High,

	async enchantmentApply(self, owner, host) {
		// This card costs (0) mana.
		host.cost = 0;
	},

	async enchantmentRemove(self, owner, host) {
		// This card costs (0) mana.
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};
