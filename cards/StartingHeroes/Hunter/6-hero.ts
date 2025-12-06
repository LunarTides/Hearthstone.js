// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Rexxar",
	text: "Hunter starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Hunter],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "9d3ab9ef-83fb-4568-a847-4a7c9fcc4713",

	armor: 0,
	heropowerId: game.cardIds.steadyShot_d862c73d_b603_48cf_b573_7cc57be1c4a4,
};
