// Created by the Custom Card Creator

import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Rexxar",
	text: "Hunter starting hero",
	cost: 0,
	type: "Hero",
	classes: ["Hunter"],
	rarity: "Free",
	collectible: false,
	tags: ["starting_hero"],
	id: 6,

	armor: 0,
	heropowerId: game.cardIds.steadyShot116,
};
