// Created by the Custom Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	Event,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Frail Ghoul",
	text: "<b>Charge</b> At the end of your turn, this minion dies.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.DeathKnight],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 23,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.Undead],

	async create(self, owner) {
		self.addKeyword(Keyword.Charge);
	},

	async passive(self, owner, key, value, eventPlayer) {
		// At the end of your turn, this minion dies.

		// Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
		if (!game.event.is(key, value, Event.EndTurn) || eventPlayer !== owner) {
			return;
		}

		// Destroy this minion
		await self.destroy();
	},

	async test(self, owner) {
		const checkIfThisCardIsOnTheBoard = () =>
			owner.board.some((card) => card.uuid === self.uuid);

		// Summon the minion, the minion should now be on the board
		await owner.summon(self);
		assert(checkIfThisCardIsOnTheBoard());

		// Broadcast a dummy event, the minion should still be on the board
		await game.event.broadcastDummy(owner);
		assert(checkIfThisCardIsOnTheBoard());

		// End the player's turn, the minion should no longer be on the board
		await game.endTurn();
		assert(!checkIfThisCardIsOnTheBoard());
	},
};
