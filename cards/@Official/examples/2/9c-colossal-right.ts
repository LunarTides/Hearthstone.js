// Created by Hand

import { type Blueprint, Class, Rarity, Tribe, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	// This will be summoned below the main minion
	name: "Right Arm",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f81-7004-97b1-2971ddb6a2f5",

	attack: 1,
	health: 2,
	tribes: [Tribe.Beast],
};
