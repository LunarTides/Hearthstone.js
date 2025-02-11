// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Jaina Proudmoore",
	text: "Mage starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Mage"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 4,

	armor: 0,
	heropowerId: game.cardIds.fireblast114,
};
