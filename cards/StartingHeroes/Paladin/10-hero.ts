// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Uther Lightbringer",
	text: "Paladin starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Paladin"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 10,

	armor: 0,
	heropowerId: game.cardIds.reinforce120,
};
