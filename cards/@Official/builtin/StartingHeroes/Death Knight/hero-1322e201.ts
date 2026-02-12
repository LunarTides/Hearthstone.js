// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "The Lich King",
	text: "Death knight starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.DeathKnight],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "019bc665-4f82-7001-b57a-1322e201596c",

	armor: 0,
	heropowerId: game.cardIds.ghoulCharge_019bc665_4f82_7002_ad5c_d2adeca7ffd1,
};
