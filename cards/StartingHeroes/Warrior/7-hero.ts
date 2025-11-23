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
	id: 7,

	armor: 0,
	heropowerId: game.cardIds.armorUp_117,
};
