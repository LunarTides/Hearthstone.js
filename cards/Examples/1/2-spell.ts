// Created by Hand

import {
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	// If a field doesn't get a comment to itself, it has already been explained in a previous example card.
	name: "Spell Example",
	text: "Just an example card (Does nothing)",
	cost: 1,

	// Remember to properly set the type. (Done automatically by the card creator)
	type: Type.Spell,

	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "b361c5c9-cfb6-4284-86c6-efd23f4dbdfa",

	// The schools of the spell.
	spellSchools: [SpellSchool.Shadow],
};
