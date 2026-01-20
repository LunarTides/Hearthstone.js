// Created by Hand (before the Card Creator Existed)

import {
	type Blueprint,
	Class,
	Rarity,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Searing Totem",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.Totem],
	id: "019bc665-4f81-7025-ae8e-94c9fa32fddc",

	attack: 1,
	health: 1,
	tribes: [Tribe.Totem],
};
