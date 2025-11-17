// Created by Hand

import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

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
	id: 41,

	attack: 2,
	health: 2,
	tribes: [MinionTribe.None],
};
