// Created by the Custom Card Creator

import { type Blueprint, Class, Rarity, Tag, Type } from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Uther Lightbringer",
	text: "Paladin starting hero",
	cost: 0,
	type: Type.Hero,
	classes: [Class.Paladin],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.StartingHero],
	id: "4f9e4148-4b22-47fc-8e22-89869528781a",

	armor: 0,
	heropowerId: game.cardIds.reinforce_454f8520_900b_4933_adf0_5188ac6eaed2,
};
