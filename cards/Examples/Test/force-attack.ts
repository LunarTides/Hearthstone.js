// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	Event,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Force Attack Test",
	text: "Whenever a minion attacks, it attacks again.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f7f-7013-8f41-869198c0b451",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async create(self, owner) {
		// Store the attacker / target combo in storage.

		self.setStorage(self.uuid, "attack", []);
	},

	async passive(self, owner, key, value, eventPlayer) {
		// Whenever a minion attacks, it attacks again.

		/*
		 * If the turn ends, clear the storage.
		 * This is so that you can attack with that combo next turn and it still works.
		 */
		if (key === Event.EndTurn) {
			self.setStorage(self.uuid, "attack", []);
		}

		if (!game.event.is(key, value, Event.Attack)) {
			return;
		}

		const [attacker, target] = value;

		/*
		 * If the combo is the same, don't do anything
		 * This is so that it doesn't get stuck in an infinite loop
		 */
		if (game.lodash.isEqual(value, self.getStorage(self.uuid, "attack"))) {
			return;
		}

		// If it is not the same, clear the storage.
		self.setStorage(self.uuid, "attack", []);

		if (!(attacker instanceof Card)) {
			return;
		}

		self.setStorage(self.uuid, "attack", value);

		/*
		 * Force attack. Note the { force: true } flag here.
		 * We need to force it, since the card shouldn't be able to attack two times in a row
		 */
		await game.attack(attacker, target, { force: true });
	},

	async test(self, owner) {
		const opponent = owner.getOpponent();

		assert.equal(opponent.health, 30);
		await owner.summon(self);

		await game.attack(self, opponent, { force: true });
		assert.equal(self.attack, 1);
		assert.equal(opponent.health, 28);
	},
};
