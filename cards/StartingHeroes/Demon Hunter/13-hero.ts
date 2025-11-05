// Created by the Custom Card Creator

import { type Blueprint, CardTag, Class, Rarity, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Illidan Stormrage",
	text: "Demon hunter starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.DemonHunter],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.StartingHero],
	id: 13,

	armor: 0,
	heropowerId: game.cardIds.demonClaws_123,
};
