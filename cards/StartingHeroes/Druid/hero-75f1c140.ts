// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Malfurion Stormrage",
	text: "Druid starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Druid],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "019bc665-4f81-702a-8f9c-75f1c14058d5",

	armor: 0,
	heropowerId: game.cardIds.shapeshift_019bc665_4f81_7029_8820_5fe5ff46bf13,
};
