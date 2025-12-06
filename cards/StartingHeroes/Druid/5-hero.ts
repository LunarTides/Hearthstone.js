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
	id: "65e899dc-7358-4a16-9c76-13559af78b09",

	armor: 0,
	heropowerId: game.cardIds.shapeshift_ae743f0d_b9b7_4651_b203_56245920367b,
};
