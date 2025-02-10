// Created by Hand (before the Card Creator Existed)

// This is used in Adapt

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Plant",
	text: "",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 3,

	attack: 1,
	health: 1,
	tribe: "None",
};
