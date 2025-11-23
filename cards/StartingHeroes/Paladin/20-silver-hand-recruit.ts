// Created by Hand (before the Card Creator Existed)

import { type Blueprint, Class, Rarity, Tribe, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Silver Hand Recruit",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Paladin],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 20,

	attack: 1,
	health: 1,
	tribes: [Tribe.None],
};
