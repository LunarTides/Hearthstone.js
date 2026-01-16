// Created by Hand

import { type Blueprint, Class, Rarity, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	// This looks like a minion card except for the type and no tribe.
	name: "Weapon Example",
	text: "Just an example card (Does nothing)",
	cost: 1,
	type: Type.Weapon,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f81-7013-a277-20255f7ced29",

	// Weapons have attack / health, but no tribe.
	attack: 5,
	health: 3,
};
