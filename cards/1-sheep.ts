// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Sheep",
	text: "",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 1,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.Beast],
};
