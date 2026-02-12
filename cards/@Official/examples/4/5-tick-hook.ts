// Created by Hand

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
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Tick Hook Example",
	text: "Fill up your mana. For the rest of the game, your mana never decreases.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f80-7014-b382-e7c4faafc930",

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		// Fill up your mana. For the rest of the game, your mana never decreases.

		/*
		 * Ticks are called more often than passives.
		 * Passives get called when an event gets broadcast, ticks get called when an event gets broadcast AND every game loop.
		 * So ticks might be better to use in some situations where you don't want it to be dependent on events (events can be suppressed),
		 * or you want it to be triggered every game loop no matter what.
		 */

		/*
		 * This returns a function that, when called, will remove the hook.
		 * You are given the key and value of the event.
		 * I don't think you will need them for tick hooks, since they are not supposed to be dependent on events, but you are free to use them if you want.
		 */

		/*
		 * Gain max mana every tick.
		 * This lasts for the rest of the game, since we don't unhook it.
		 * This is *technically* not what the text says,
		 * but the user won't notice the difference since the mana gets refilled too quickly.
		 */
		const _unhook = game.event.hookToTick(async () => {
			owner.addMana(owner.maxMana);
		});

		// If you want to use an event, do this:
		// const unhook = game.event.hookToTick<Event.PlayCard>(async (key, value) => {});
	},

	async test(self, owner) {
		owner.mana = 5;
		await self.trigger(Ability.Cast);

		// The game hasn't ticked yet
		assert.equal(owner.mana, 5);

		// Manually tick the game
		await game.event.tick(Event.Dummy, undefined, owner);

		assert.equal(owner.mana, 10);

		// Play a card to verify that the mana doesn't decrease
		const card = await Card.create(game.ids.Official.builtin.sheep[0], owner);
		const result = await game.play(card, owner);

		assert.equal(result, GamePlayCardReturn.Success);
		assert.equal(owner.mana, 10);
	},
};
