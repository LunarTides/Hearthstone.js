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
	id: "019bc665-4f81-7027-b26a-f16803fe8f22",

	armor: 0,
	heropowerId: game.ids.Official.builtin.steady_shot[0],
};
