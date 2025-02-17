// Created by the Vanilla Card Creator

import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Treant",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Druid],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 83,

	attack: 2,
	health: 2,
	tribe: MinionTribe.None,
};
