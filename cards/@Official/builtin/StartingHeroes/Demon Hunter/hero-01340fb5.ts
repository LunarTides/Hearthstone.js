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
	id: "019bc665-4f81-702b-b8e2-01340fb5a520",

	armor: 0,
	heropowerId: game.cardIds.demonClaws_019bc665_4f81_702c_bbba_187394fa2e11,
};
