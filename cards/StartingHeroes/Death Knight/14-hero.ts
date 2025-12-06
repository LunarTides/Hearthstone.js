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
	id: "c957aede-d565-4c10-8eb5-63f359d20d7d",

	armor: 0,
	heropowerId: game.cardIds.ghoulCharge_f9e328c6_9195_4de0_a14d_02f797d0f3ba,
};
