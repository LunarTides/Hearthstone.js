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
	id: "70525717-23ae-4b7f-8140-4337c980396e",

	attack: 1,
	health: 1,
	tribes: [Tribe.Totem],
};
