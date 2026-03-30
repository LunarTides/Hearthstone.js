// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Uther Lightbringer",
	text: "Paladin starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Paladin],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "019bc665-4f81-701d-9a1a-4ae00820be89",

	armor: 0,
	heropowerId: game.ids.Official.builtin.reinforce[0],
};
