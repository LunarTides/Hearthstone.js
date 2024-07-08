// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/internal.js";
import type { Blueprint, EventValue } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Force Attack Test",
	text: "Whenever a minion attacks, it attacks again.",
	cost: 1,
	type: "Minion",
	classes: ["Neutral"],
	rarity: "Free",
	collectible: false,
	id: 137,

	attack: 1,
	health: 1,
	tribe: "None",

	create(owner, self) {
		// Store the attacker / target combo in storage.

		self.storage.attack = [];
	},

	passive(owner, self, key, _unknownValue, eventPlayer) {
		// Whenever a minion attacks, it attacks again.

		/*
		 * If the turn ends, clear the storage.
		 * This is so that you can attack with that combo next turn and it still works.
		 */
		if (key === "EndTurn") {
			self.storage.attack = [];
		}

		if (key !== "Attack") {
			return;
		}

		const value = _unknownValue as EventValue<typeof key>;
		const [attacker, target] = value;

		/*
		 * If the combo is the same, don't do anything
		 * This is so that it doesn't get stuck in an infinite loop
		 */
		if (game.lodash.isEqual(value, self.storage.attack)) {
			return;
		}

		// If it is not the same, clear the storage.
		self.storage.attack = [];

		if (!(attacker instanceof Card)) {
			return;
		}

		self.storage.attack = value;

		/*
		 * Force attack. Note the `true` here.
		 * We need to force it, since the card shouldn't be able to attack two times in a row
		 */
		game.attack(attacker, target, true);
	},

	test(owner, self) {
		const opponent = owner.getOpponent();

		assert.equal(opponent.health, 30);
		owner.summon(self);

		game.attack(self, opponent, true);
		assert.equal(self.attack, 1);
		assert.equal(opponent.health, 28);
	},
};
