// Created by Hand

import {
	Ability,
	type AbilityCallback,
	type Blueprint,
	Class,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

/*
 * This is another way to write blueprints.
 * You might want to do this if you make a very complicated card.
 * however it is not *as* supported by scripts as the normal way.
 */
const battlecry: AbilityCallback = async (self, owner) => {
	await self.addStats(1, 1);
};

const theTestAbility: AbilityCallback = async (self, owner) => {
	await self.trigger(Ability.Battlecry);

	assert.equal(self.blueprint.attack! + 1, self.attack);
	assert.equal(self.blueprint.health! + 1, self.health);
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
	id: "03be1d22-3799-4a51-b080-4a8ffe8f9e90",

	attack: 1,
	health: 2,
	tribes: [Tribe.None],

	// If the function is named correctly, you can just write the name of the ability.
	battlecry,

	// Otherwise, do `nameOfAbility: nameOfFunction`.
	test: theTestAbility,
};
