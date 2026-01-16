// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	Rarity,
	RemoveReason,
	Tribe,
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
	id: "019bc665-4f80-7002-a804-dcded6ed0203",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async remove(self, owner, key) {
		// This minion cannot be removed from the battlefield.

		// If you return false in the `remove` ability, the card will not be removed.
		// The key is the reason for removing the card.
		if (key === RemoveReason.Destroy) {
			return false;
		}

		if (key === RemoveReason.Silence) {
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
