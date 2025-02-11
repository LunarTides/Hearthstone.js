// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Anduin Wrynn",
	text: "Priest starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Priest"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 8,

	armor: 0,
	heropowerId: game.cardIds.lesserHeal118,
};
