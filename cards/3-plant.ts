// Created by Hand (before the Card Creator Existed)

// This is used in Adapt

import { type Blueprint, Class, Rarity, Tribe, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Plant",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 3,

	attack: 1,
	health: 1,
	tribes: [Tribe.None],
};
