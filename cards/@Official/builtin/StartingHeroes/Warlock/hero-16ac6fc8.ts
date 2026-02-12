// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Gul'dan",
	text: "Warlock starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Warlock],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "019bc665-4f80-7019-b989-16ac6fc87512",

	armor: 0,
	heropowerId: game.ids.Official.builtin.life_tap[0],
};
