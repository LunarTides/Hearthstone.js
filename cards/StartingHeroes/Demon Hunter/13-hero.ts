// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Illidan Stormrage",
	text: "Demon hunter starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.DemonHunter],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "e5fd8102-9aed-44de-9a15-24f69f95e34e",

	armor: 0,
	heropowerId: game.cardIds.demonClaws_eda9ec96_b715_4146_91a9_a9a327ea7989,
};
