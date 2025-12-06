// Created by Hand

import { type Blueprint, Class, Rarity, Tribe, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	// This will be summoned above the main minion
	name: "Left Arm",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "b7bfb3c9-d353-42a6-b035-db0afa7d5eec",

	attack: 2,
	health: 1,
	tribes: [Tribe.Beast],
};
