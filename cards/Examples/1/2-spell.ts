// Created by Hand

import {
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	// If a field doesn't get a comment to itself, it has already been explained in a previous example card.
	name: "Spell Example",
	text: "Just an example card (Does nothing)",
	cost: 1,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 30,

	// The schools of the spell.
	spellSchools: [SpellSchool.Shadow],
};
