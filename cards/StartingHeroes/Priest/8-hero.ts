// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Anduin Wrynn",
	text: "Priest starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Priest],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "3b77c83a-53ef-420f-bbb6-578c54deaefb",

	armor: 0,
	heropowerId: game.cardIds.lesserHeal_7b3ef914_5138_4872_93b8_b025a5a3c60a,
};
