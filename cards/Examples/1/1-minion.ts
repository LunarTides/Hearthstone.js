// Created by Hand

// You shouldn't touch anything outside of the blueprint object.
import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	/*
	 * A blueprint only has ESSENTIAL properties, and type-specific properties (like stats or tribe)
	 * Other properties, like keywords, has to be added in the 'create' ability. More on that in `1-4`. (`Examples/1/4-taunt.ts`)
	 */

	// Essential properties first (all cards have these)

	// The name of the card.
	name: "Minion Example",

	// The description of the card. This can be anything.
	text: "Just an example card (Does nothing)",

	// How much mana the card costs. This is usually in mana.
	cost: 1,

	// The type of the card. E.g. "Minion", "Spell", "Weapon", etc...
	type: Type.Minion,

	// The classes of the card. E.g. "Neutral", "Warrior", "Hunter", etc...
	classes: [Class.Neutral],

	// The rarity of the card. E.g. "Free", "Common", "Rare", etc...
	rarity: Rarity.Free,

	/*
	 * If the card should be allowed in decks or card pools.
	 * These example cards should not be randomly generated in `discover`, or added in a deck, so all of them are uncollectible.
	 */
	collectible: false,

	/**
	 * Any tags that should be applied to the card.
	 * Tags are used to group cards together. They should be lowercase.
	 * E.g. "lackey"
	 *
	 * This can be queried like this: `Card.allWithTags(["lackey"]);`
	 */
	tags: [],

	/*
	 * The ID of the card. This is used in deckcodes, and should be unique per blueprint. This gets generated automatically by the card creator.
	 * If you have debug mode enabled, you can type `/give (id)` to give yourself the card with that id.
	 */
	id: 29,

	// After the id property, all properties below (except for abilities) are type-specific

	// The amount of attack the minion has.
	attack: 2,

	// The amount of health the minion has.
	health: 1,

	// The tribe of the minion. E.g. "Undead", "Naga", "Beast", etc...
	tribe: MinionTribe.None,
};
