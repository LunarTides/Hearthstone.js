// Created by Hand

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	Ability,
	type Blueprint,
	Class,
	Event,
	GamePlayCardReturn,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Inf Mana",
	text: "Fill up your mana. For the rest of the game, your mana never decreases.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 66,

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Fill up your mana. For the rest of the game, your mana never decreases.

		/*
		 * Gain max mana every tick.
		 * This lasts for the rest of the game, since we don't unhook it.
		 */
		game.event.hookToTick(async () => {
			owner.addMana(owner.maxMana);
		});
	},

	async test(self, owner) {
		owner.mana = 5;
		await self.trigger(Ability.Cast);

		// The game hasn't ticked yet
		assert.equal(owner.mana, 5);

		// Manually tick the game
		await game.event.tick(Event.GameLoop, -1, owner);

		assert.equal(owner.mana, 10);

		// Play a card to verify that the mana doesn't decrease
		const card = await Card.create(game.cardIds.sheep1, owner);
		const result = await game.play(card, owner);

		assert.equal(result, GamePlayCardReturn.Success);
		assert.equal(owner.mana, 10);
	},
};
