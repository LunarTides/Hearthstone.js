// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Valeera Sanguinar",
	text: "Rogue starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Rogue"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 12,

	armor: 0,
	heropowerId: game.cardIds.daggerMastery122,
};
