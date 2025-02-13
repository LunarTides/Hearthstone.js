// Created by the Custom Card Creator

import { type Blueprint, CardTag, Class, Rarity, Type } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Anduin Wrynn",
	text: "Priest starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Priest],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.StartingHero],
	id: 8,

	armor: 0,
	heropowerId: game.cardIds.lesserHeal118,
};
