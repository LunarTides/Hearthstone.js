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
	 * Look in `corrupt.ts` first.
	 * This is just an ordinary card.
	 */
	name: "Corrupted Example",
	text: "Corrupted.",
	cost: 0,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 41,

	attack: 2,
	health: 2,
	tribe: MinionTribe.None,
};
