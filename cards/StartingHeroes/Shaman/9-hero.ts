// Created by the Custom Card Creator

import { type Blueprint, CardTag, Class, Rarity, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Thrall",
	text: "Shaman starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.StartingHero],
	id: 9,

	armor: 0,
	heropowerId: game.cardIds.totemicCall_119,
};
