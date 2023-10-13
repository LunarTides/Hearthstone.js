// Created by Hand

import assert from 'node:assert';
import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
	name: 'Condition Example',
	stats: [5, 2],

	// This is a common condition
	text: '<b>Battlecry:</b> If your deck has no duplicates, draw a card.',

	cost: 1,
	type: 'Minion',
	tribe: 'None',
	classes: ['Neutral'],
	rarity: 'Free',
	uncollectible: true,
	id: 52,

	create(plr, self) {
		// By having this here, the battlecry function below will only trigger if the condition function returns true
		self.conditioned = ['battlecry'];
	},

	// This will only trigger if the `condition` function below returns true.
	battlecry(plr, self) {
		// If your deck has no duplicates, draw a card.

		// Makes the card's owner draw a card.
		//
		// If you don't put the `conditioned: ["battlecry"]` at the top, you can use this code to achieve the same thing.
		// if (!self.condition()) return;

		// Draw a card
		plr.drawCard();
	},

	// This function will be run when the card is played.
	// This function will also be run every tick in order to add / remove the ` (Condition cleared!)` text.
	// If this function returns true when this card is played, the battlecry will be triggered.
	condition(plr, self) {
		// `plr.highlander` will return true if the player has no duplicates in their deck.
		//
		// return true; // Uncomment this to see how a fulfilled condition looks like.
		return plr.highlander();
	},

	test(plr, self) {
		const {length} = plr.deck;
		plr.hand = [];

		// The player shouldn't fulfill the condition
		assert(!plr.highlander());
		self.activate('battlecry');

		// Assert that the player didn't draw a card
		assert(plr.deck.length === length);
		assert(plr.hand.length === 0);

		// The player should fulfill the condition
		plr.deck = [game.createCard('Sheep', plr)];
		assert(plr.highlander());
		assert(plr.deck.length === 1);

		self.activate('battlecry');

		assert(plr.hand.length as number === 1);
	},
};
