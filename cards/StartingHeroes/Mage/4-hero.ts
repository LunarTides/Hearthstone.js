// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Jaina Proudmoore",
	text: "Mage starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Mage],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: 4,

	armor: 0,
	heropowerId: game.cardIds.fireblast_114,
};
