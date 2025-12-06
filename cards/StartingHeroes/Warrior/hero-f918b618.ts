// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Garrosh Hellscream",
	text: "Warrior starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Warrior],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "f918b618-d707-4f96-a99d-a1922724446f",

	armor: 0,
	heropowerId: game.cardIds.armorUp_ab216cd7_acda_432e_bde4_d3568846e6f2,
};
