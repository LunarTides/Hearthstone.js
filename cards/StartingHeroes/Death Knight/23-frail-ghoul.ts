// Created by the Custom Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Frail Ghoul",
	text: "<b>Charge</b> At the end of your turn, this minion dies.",
	cost: 1,
	type: "Minion",
	classes: ["Death Knight"],
	rarity: "Free",
	collectible: false,
	id: 23,

	attack: 1,
	health: 1,
	tribe: "Undead",

	async create(owner, self) {
		self.addKeyword("Charge");
	},

	async passive(owner, self, key, value, eventPlayer) {
		// At the end of your turn, this minion dies.

		// Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
		if (key !== "EndTurn" || eventPlayer !== owner) {
			return;
		}

		// Kill this minion
		await self.kill();
	},

	async test(owner, self) {
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
