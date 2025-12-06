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
	id: "d5cb53de-a675-4ecd-a958-407a485e0345",

	armor: 0,
	heropowerId: game.cardIds.totemicCall_366a12ef_3958_4329_ad5c_ba740bc7d1a4,
};
