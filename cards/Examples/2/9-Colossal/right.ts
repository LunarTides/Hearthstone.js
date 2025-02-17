// Created by Hand

import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	/*
	 * Look in `main.ts` first.
	 * This will be summoned below the main minion
	 */
	name: "Right Arm",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 44,

	attack: 1,
	health: 2,
	tribes: [MinionTribe.Beast],
};
