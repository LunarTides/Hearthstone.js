// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Illidan Stormrage",
	text: "Demon hunter starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Demon Hunter"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 13,

	armor: 0,
	heropowerId: game.cardIds.demonClaws123,
};
