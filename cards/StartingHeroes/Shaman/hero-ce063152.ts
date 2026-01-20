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
	id: "019bc665-4f80-7023-9a53-ce063152e9a5",

	armor: 0,
	heropowerId: game.cardIds.totemicCall_019bc665_4f80_7024_ba8b_78e125a21f37,
};
