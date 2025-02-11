// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Gul'dan",
	text: "Warlock starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Warlock"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 11,

	armor: 0,
	heropowerId: game.cardIds.lifeTap121,
};
