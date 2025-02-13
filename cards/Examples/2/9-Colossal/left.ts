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
	 * This will be summoned above the main minion
	 */
	name: "Left Arm",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 43,

	attack: 2,
	health: 1,
	tribe: MinionTribe.Beast,
};
