// Created by Hand

// You shouldn't touch anything outside of the blueprint object.
import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
	// A blueprint only has ESSENTIAL properties, and type-specific properties (like stats or tribe)
	// Other properties, like keywords, has to be added in the 'create' ability. More on that in `1-4`.

	// The name of the card. It MUST be unique.
	// If the card has a common name like `Plant`, then use a display name.
	// More on this in `2-7`.
	name: 'Minion Example',

	// The stats. The first number is its attack, and the second number is its health.
	stats: [2, 1],

	// The description of the card. This can be anything.
	text: 'Just an example card (Does nothing)',

	// How much mana the card costs.
	cost: 1,

	// The type of the card. E.g. "Minion", "Spell", "Weapon", etc...
	type: 'Minion',

	// The tribe of the minion. E.g. "Undead", "Naga", "Beast", etc...
	tribe: 'None',

	// The classes of the card. E.g. "Neutral", "Warrior", "Hunter", etc...
	classes: ['Neutral'],

	// The rarity of the card. E.g. "Free", "Common", "Rare", etc...
	rarity: 'Free',

	// If the card should not be allowed in decks, or in card pools.
	// These example cards should not be randomly generated in `discover`, or added in a deck, so all of them are uncollectible.
	// If the card isn't uncollectible, you don't need to set the uncollectible property at all.
	uncollectible: true,

	// The ID of the card. This is used in deckcodes, and should be unique per blueprint. This gets generated automatically by the card creator.
	// If you have debug mode enabled, you can type `/give (id)` to give yourself the card with that id.
	id: 29,
};
