// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	/*
	 * Look in `forge.ts` first.
	 * This is just an ordinary card.
	 */
	name: "Forged Example",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 76,

	attack: 2,
	health: 2,
	tribe: MinionTribe.None,
};
