// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Thrall",
	text: "Shaman starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Shaman],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: 9,

	armor: 0,
	heropowerId: game.cardIds.totemicCall_119,
};
