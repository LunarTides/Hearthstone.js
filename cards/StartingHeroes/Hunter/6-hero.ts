// Created by the Custom Card Creator

import { type Blueprint, CardTag, Class, Rarity, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Rexxar",
	text: "Hunter starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Hunter],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.StartingHero],
	id: 6,

	armor: 0,
	heropowerId: game.cardIds.steadyShot_116,
};
