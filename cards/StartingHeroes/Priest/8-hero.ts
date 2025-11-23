// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Anduin Wrynn",
	text: "Priest starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Priest],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: 8,

	armor: 0,
	heropowerId: game.cardIds.lesserHeal_118,
};
