// Created by Hand

import assert from "node:assert";
import {
	Ability,
	type AbilityCallback,
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

/*
 * This is another way to write blueprints
 * You might want to do this if you make a very complicated card
 * however it is not _as_ supported by scripts as the default method.
 */
const battlecry: AbilityCallback = async (owner, self) => {
	await self.addStats(1, 1);
};

const theTestAbility: AbilityCallback = async (owner, self) => {
	await self.activate(Ability.Battlecry);

	assert.equal((self.blueprint.attack ?? 0) + 1, self.attack);
	assert.equal((self.blueprint.health ?? 0) + 1, self.health);
};

export const blueprint: Blueprint = {
	name: "Another Ability Example",
	text: "<b>Battlecry:</b> Give this minion +1/+1.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 77,

	attack: 1,
	health: 2,
	tribes: [MinionTribe.None],

	// If the function is named correctly, you can just write the name of the ability
	battlecry,

	// Otherwise, do `nameOfAbility: nameOfFunction`.
	test: theTestAbility,
};
