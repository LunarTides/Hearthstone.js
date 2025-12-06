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
	id: "7807f17c-0e32-4523-af9d-4e374a9be937",

	armor: 0,
	heropowerId: game.cardIds.lifeTap_bdb57b4f_87ab_4586_a5fe_c3ed22ad270b,
};
