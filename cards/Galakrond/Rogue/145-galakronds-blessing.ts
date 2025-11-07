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
	name: "Galakrond's Blessing",
	text: "This card costs (0) mana.",
	cost: 0,
	type: Type.Enchantment,
	classes: [Class.Rogue],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 145,

	enchantmentPriority: EnchantmentPriority.High,

	async enchantmentSetup(self, owner, host) {
		// This card costs (0) mana.

		// FIXME: Doesn't work since the cost can be changed by other enchantments. Figure out a solution.
		// self.setStorage(self.uuid, "originalCost", host.cost);
		self.setStorage(self.uuid, "originalCost", host.backups.init.cost);
	},

	async enchantmentApply(self, owner, host) {
		// This card costs (0) mana.
		host.cost = 0;
	},

	async enchantmentRemove(self, owner, host) {
		// This card costs (0) mana.
		host.cost = self.getStorage(self.uuid, "originalCost")!;
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};
