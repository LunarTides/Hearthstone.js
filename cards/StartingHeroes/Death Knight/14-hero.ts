// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "The Lich King",
	text: "Death knight starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Death Knight"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 14,

	armor: 0,
	heropowerId: game.cardIds.ghoulCharge124,
};
