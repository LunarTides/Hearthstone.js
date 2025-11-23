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
	id: 5,

	armor: 0,
	heropowerId: game.cardIds.shapeshift_115,
};
