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
	id: "c110e696-d85e-40f1-ad2e-2718f5185e1d",

	attack: 1,
	health: 2,
	tribes: [Tribe.Beast],
};
