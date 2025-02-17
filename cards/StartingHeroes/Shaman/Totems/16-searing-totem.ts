// Created by Hand (before the Card Creator Existed)

import {
	type Blueprint,
	CardTag,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Searing Totem",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.Totem],
	id: 16,

	attack: 1,
	health: 1,
	tribe: MinionTribe.Totem,
};
