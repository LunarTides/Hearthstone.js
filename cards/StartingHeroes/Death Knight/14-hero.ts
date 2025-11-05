// Created by the Custom Card Creator

import { type Blueprint, CardTag, Class, Rarity, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "The Lich King",
	text: "Death knight starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.DeathKnight],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.StartingHero],
	id: 14,

	armor: 0,
	heropowerId: game.cardIds.ghoulCharge_124,
};
