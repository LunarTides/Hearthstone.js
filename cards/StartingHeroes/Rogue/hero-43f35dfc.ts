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
	id: "43f35dfc-c0e1-41bb-8d86-c276c29e76f3",

	armor: 0,
	heropowerId: game.cardIds.daggerMastery_7dc5b90e_3ef6_4b2c_a448_f4c5dffe9803,
};
