// Created by the Custom Card Creator

import { type Blueprint, CardTag, Class, Rarity, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Uther Lightbringer",
	text: "Paladin starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Paladin],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.StartingHero],
	id: 10,

	armor: 0,
	heropowerId: game.cardIds.reinforce_120,
};
