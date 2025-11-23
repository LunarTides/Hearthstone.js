// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	Event,
	GameAttackReturn,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Frozen Test",
	text: "This is forever <b>Frozen</b>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 74,

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async create(self, owner) {
		await self.freeze();
	},

	async passive(self, owner, key, value, eventPlayer) {
		// This is forever Frozen

		if (!game.event.is(key, value, Event.StartTurn)) {
			return;
		}

		await self.freeze();
	},

	async test(self, owner) {
		// Summon this minion
		await owner.summon(self);

		for (let i = 0; i < 5; i++) {
			// Attacking the enemy hero this this minion should always return "frozen"
			const returnValue = await game.attack(self, owner.getOpponent());
			assert.equal(returnValue, GameAttackReturn.Frozen);

			await game.endTurn();
			await game.endTurn();
		}
	},
};
