// Created by Hand

import { type Blueprint, Class, Rarity, Tribe, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	// This is just an ordinary card.
	name: "Corrupted Example",
	text: "Corrupted.",
	cost: 0,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "ba8de33e-a8fd-426e-9ac0-08f5a3c949bc",

	attack: 2,
	health: 2,
	tribes: [Tribe.None],
};
