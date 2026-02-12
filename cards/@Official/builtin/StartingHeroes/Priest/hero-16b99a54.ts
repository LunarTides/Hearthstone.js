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
	id: "019bc665-4f81-7010-81c7-16b99a54e840",

	armor: 0,
	heropowerId: game.cardIds.lesserHeal_019bc665_4f81_700f_baf6_98a416f07ccc,
};
