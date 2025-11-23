// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Gul'dan",
	text: "Warlock starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Warlock],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: 11,

	armor: 0,
	heropowerId: game.cardIds.lifeTap_121,
};
