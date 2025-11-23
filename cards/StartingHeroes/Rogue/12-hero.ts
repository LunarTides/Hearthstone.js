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
	id: 12,

	armor: 0,
	heropowerId: game.cardIds.daggerMastery_122,
};
