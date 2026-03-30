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
	id: "019bc665-4f80-702b-9638-5a8b8e46ef3a",

	attack: 2,
	health: 2,
	tribes: [Tribe.None],
};
