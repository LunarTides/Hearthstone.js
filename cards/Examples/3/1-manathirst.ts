// Created by Hand

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Manathirst Example",
	text: "<b>Battlecry:</b> Freeze an enemy minion. Manathirst (6): Silence it first.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 50,

	attack: 1,
	health: 2,
	tribes: [MinionTribe.None],

	async battlecry(owner, self) {
		const manathirst = self.manathirst(6);

		// Make the prompt.
		const prompt = manathirst
			? "Silence then freeze an enemy minion."
			: "Freeze an enemy minion.";

		/*
		 * Select a target to freeze (and silence)
		 * The first argument is the prompt to ask the user.
		 * The second argument is this card (aka `self`).
		 * The third argument is an options object with targeting flags. For example, if `alignment` is set to "enemy", the user can only select enemy targets, if it's "friendly", the user can only select friendly targets, if it's omitted, the user can select any target.
		 *
		 * Ask the user to select a target based on the `prompt`, the user can only select enemy minions
		 */
		const target = await game.functions.interact.prompt.targetCard(
			prompt,
			self,
			{ alignment: "enemy" },
		);

		/*
		 * If target is null, it means that the user cancelled their selection.
		 * Return `Card.REFUND` to refund the card.
		 */
		if (!target) {
			return Card.REFUND;
		}

		// If the manathirst was successful, silence the target first.
		if (manathirst) {
			await target.silence();
		}

		// Freeze the target
		await target.freeze();

		// Return true since otherwise, typescript will complain about the function not returning a value in all branches.
		return true;
	},

	// This is optional, you will learn more about it in the `condition` example in `3-3`.
	async condition(owner, self) {
		return self.manathirst(6);
	},

	async test(owner, self) {
		const sheep = await Card.create(game.cardIds.sheep1, owner.getOpponent());
		await sheep.addStats(4, 4);
		await owner.getOpponent().summon(sheep);

		assert.equal(sheep.attack, 5);
		assert.equal(sheep.health, 5);
		assert(!sheep.hasKeyword(Keyword.Frozen));

		owner.emptyMana = 1;
		assert.equal(owner.emptyMana, 1);
		owner.inputQueue = ["1"];
		await self.trigger(Ability.Battlecry);

		assert(sheep.hasKeyword(Keyword.Frozen));
		sheep.remKeyword(Keyword.Frozen);
		assert(!sheep.hasKeyword(Keyword.Frozen));

		owner.emptyMana = 6;
		owner.inputQueue = ["1"];
		await self.trigger(Ability.Battlecry);

		assert(sheep.hasKeyword(Keyword.Frozen));
		assert.equal(sheep.attack, 1);
		assert.equal(sheep.health, 1);
	},
};
