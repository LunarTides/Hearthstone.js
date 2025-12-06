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
	id: "dcbe7656-d98e-4922-9936-41ae9a12bc02",

	armor: 0,
	heropowerId: game.cardIds.fireblast_4b71b3e6_0dcb_4119_9189_5885718bac5b,
};
