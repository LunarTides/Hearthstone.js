// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Valeera Sanguinar",
	text: "Rogue starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Rogue],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "019bc665-4f81-700e-a08e-3ac70bfbdc2a",

	armor: 0,
	heropowerId: game.ids.Official.builtin.dagger_mastery[0],
};
