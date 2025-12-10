// Created by Hand (before the Card Creator Existed)

import { Card } from "@Game/card.ts";
import {
	Ability,
	Alignment,
	type Blueprint,
	Class,
	Keyword,
	Rarity,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Goblin Lackey",
	text: "<b>Battlecry:</b> Give a friendly minion +1 Attack and <b>Rush</b>.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [Tag.Lackey],
	id: "4cde4d98-b048-4369-9957-2879db026746",

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async battlecry(self, owner) {
		// Give a friendly minion +1 Attack and Rush.

		// Prompt the user to select a friendly minion
		const target = await game.prompt.targetCard(
			"Give a friendly minion +1 Attack and Rush",
			self,
			{ alignment: Alignment.Friendly },
		);

		// If no target was selected, refund
		if (!target) {
			return Card.REFUND;
		}

		// Add +1 Attack
		await target.addStats(1, 0);

		// Add Rush
		target.addKeyword(Keyword.Rush);
		return true;
	},

	async test(self, owner) {
		// Summon a sheep
		const sheep = await Card.create(
			game.cardIds.sheep_668b9054_7ca9_49af_9dd9_4f0126c6894c,
			owner,
		);
		await owner.summon(sheep);

		// Activate the battlecry, choose the sheep
		owner.inputQueue = ["f0"];
		await self.trigger(Ability.Battlecry);

		// The sheep should have 2 attack and rush
		assert.equal(sheep.attack, 2);
		assert(sheep.hasKeyword(Keyword.Rush));
	},
};
