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
	id: "019bc665-4f81-7022-8fb3-03df1993cdb1",

	armor: 0,
	heropowerId: game.ids.Official.builtin.fireblast[0],
};
