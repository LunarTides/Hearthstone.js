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
	name: "Enchantment Example",
	text: "This card costs (1) less.",
	cost: 0,

	// `New type.
	type: Type.Enchantment,

	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],

	// Remember this id.
	id: "f9ef24ac-0556-49d0-9fe8-b859ce689a4e",

	// This is how the game should prioritize the enchantment.
	// Higher priority enchantments get applied before lower priority ones.
	//
	// For example, say we have an enchantment that says "This card costs (0) mana."
	// Now lets say we give both that enchantment and another enchantment that says "This card costs (1) more." to a card that costs 5 mana.
	// If they have equal priority, one of two things can happen:
	// 1. The card's cost goes: 5 > 6 > 0
	// 2. The card's cost goes: 5 > 0 > 1
	//
	// The latter case is the intended result of having those two enchantments active at the same time right?
	// So to counter this issue, the former enchantment can have a higher priority (`EnchantmentPriority.High`) than the latter.
	// Avoid using `EnchantmentPriority.Highest` unless `High` doesn't work for your needs.
	enchantmentPriority: EnchantmentPriority.Normal,

	// This ability is called when the enchantment is first applied to the host. It only runs once.
	// You can use this to set up something related to the host when the enchantment is first added.
	async enchantmentSetup(self, owner, host) {
		// This card costs (1) less.
	},

	// This ability is called when the enchantment should be applied. Here you can do something to the "host" of the enchantment.
	// When a card gets an enchantment applied, the game removes the all of card's enchantments (`enchantmentRemove`), then applies them again ("refresh").
	// Since this ability can get called often, you should avoid doing anything too computationally intense here. See `Card.storage` and `Game.cache`.
	async enchantmentApply(self, owner, host) {
		// This card costs (1) less.
		host.cost -= 1;
	},

	// This ability is called when the enchantment should be removed from this card.
	// This is also called when the game "refreshes" a card's enchantments.
	// Undo whatever you did to the host in `enchantmentApply` here.
	async enchantmentRemove(self, owner, host) {
		// This card costs (1) less.
		host.cost += 1;
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};
