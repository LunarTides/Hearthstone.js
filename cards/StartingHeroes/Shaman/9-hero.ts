// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Thrall",
	text: "Shaman starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Shaman"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 9,

	armor: 0,
	heropowerId: game.cardIds.totemicCall119,
};
