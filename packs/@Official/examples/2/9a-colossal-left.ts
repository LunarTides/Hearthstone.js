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
	id: "019bc665-4f81-7002-90e0-0fb2951fa210",

	attack: 2,
	health: 1,
	tribes: [Tribe.Beast],
};
