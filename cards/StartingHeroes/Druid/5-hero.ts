// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Malfurion Stormrage",
	text: "Druid starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Druid"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 5,

	armor: 0,
	heropowerId: game.cardIds.shapeshift115,
};
