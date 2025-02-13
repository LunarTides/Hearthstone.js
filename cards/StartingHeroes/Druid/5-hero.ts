// Created by the Custom Card Creator

import { type Blueprint, CardTag, Class, Rarity, Type } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Malfurion Stormrage",
	text: "Druid starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Druid],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.StartingHero],
	id: 5,

	armor: 0,
	heropowerId: game.cardIds.shapeshift115,
};
