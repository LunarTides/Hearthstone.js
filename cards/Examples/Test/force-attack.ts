// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	Event,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Force Attack Test",
	text: "Whenever a minion attacks, it attacks again.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 137,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async create(owner, self) {
		// Store the attacker / target combo in storage.

		self.storage.attack = [];
	},

	async passive(owner, self, key, value, eventPlayer) {
		// Whenever a minion attacks, it attacks again.

		/*
		 * If the turn ends, clear the storage.
		 * This is so that you can attack with that combo next turn and it still works.
		 */
		if (key === Event.EndTurn) {
			self.storage.attack = [];
		}

		if (!game.event.is(key, value, Event.Attack)) {
			return;
		}

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
		 * Force attack. Note the { force: true } flag here.
		 * We need to force it, since the card shouldn't be able to attack two times in a row
		 */
		await game.attack(attacker, target, { force: true });
	},

	async test(owner, self) {
		const opponent = owner.getOpponent();

		assert.equal(opponent.health, 30);
		await owner.summon(self);

		await game.attack(self, opponent, { force: true });
		assert.equal(self.attack, 1);
		assert.equal(opponent.health, 28);
	},
};
