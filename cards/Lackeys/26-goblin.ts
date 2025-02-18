// Created by Hand (before the Card Creator Existed)

import assert from "node:assert";
import { Card } from "@Game/card.js";
import {
	Ability,
	type Blueprint,
	CardTag,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	TargetAlignment,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Goblin Lackey",
	text: "<b>Battlecry:</b> Give a friendly minion +1 Attack and <b>Rush</b>.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.Lackey],
	id: 26,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	async battlecry(owner, self) {
		// Give a friendly minion +1 Attack and Rush.

		// Prompt the user to select a friendly minion
		const target = await game.functions.interact.prompt.targetCard(
			"Give a friendly minion +1 Attack and Rush",
			self,
			TargetAlignment.Friendly,
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

	async test(owner, self) {
		// Summon a sheep
		const sheep = await Card.create(game.cardIds.sheep1, owner);
		await owner.summon(sheep);

		// Activate the battlecry, choose the sheep
		owner.inputQueue = ["1"];
		await self.trigger(Ability.Battlecry);

		// The sheep should have 2 attack and rush
		assert.equal(sheep.attack, 2);
		assert(sheep.hasKeyword(Keyword.Rush));
	},
};
