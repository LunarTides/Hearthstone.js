// Created by the Custom Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	Event,
	GameAttackReturn,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

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
	tribes: [MinionTribe.None],

	async create(owner, self) {
		await self.freeze();
	},

	async passive(owner, self, key, value, eventPlayer) {
		// This is forever Frozen

		if (!game.event.is(key, value, Event.StartTurn)) {
			return;
		}

		await self.freeze();
	},

	async test(owner, self) {
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
