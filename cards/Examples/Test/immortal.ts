// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Immortal Test",
	text: "<i>This minion cannot be removed from the battlefield.</i>",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 135,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async remove(self, owner, key) {
		// This minion cannot be removed from the battlefield.

		// If you return false in the `remove` ability, the card will not be removed.

		/*
		 * The key is the reason for removing the card.
		 * It can currently only be "DestroyCard" or "SilenceCard"
		 */
		if (key === "DestroyCard") {
			return false;
		}

		if (key === "SilenceCard") {
			return true;
		}

		return true;
	},

	async test(self, owner) {
		// Summon this minion
		await owner.summon(self);
		await self.destroy();

		assert(owner.board.includes(self));
	},
};
