// Created by Hand (before the Card Creator Existed)

import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Draconic Imp",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Warlock],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 21,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.Demon],
};
