// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Sheep",
	text: "",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	tags: [],
	id: 1,

	attack: 1,
	health: 1,
	tribe: "Beast",
};
