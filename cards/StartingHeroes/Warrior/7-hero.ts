// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Garrosh Hellscream",
	text: "Warrior starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Warrior"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 7,

	armor: 0,
	heropowerId: game.cardIds.armorUp117,
};
