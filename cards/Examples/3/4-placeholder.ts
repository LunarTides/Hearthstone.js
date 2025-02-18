// Created by Hand

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Placeholder Example",

	// The things with `{...}` will be replaced in the `placeholder` function.
	text: "Battlecry: Gain mana equal to the turn counter. (Currently {turns}, {laugh}, {turns}, {next thing is} {test}, {placeholder without replacement})",

	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 53,

	spellSchools: [SpellSchool.None],

	async cast(owner, self) {
		// Gain mana equal to the turn counter.
		const turns = game.functions.util.getTraditionalTurnCounter();

		owner.addMana(turns);
	},

	// This function will be run every tick, and will replace the placeholders in the description with this function's return value.
	async placeholders(owner, self) {
		/*
		 * All occurances of `{turns}` will be replaced by the value in the `turns` variable.
		 * All `{laugh}` will be replaced by "haha lol".
		 * All `{nextThingIs}` will be replaced by "The next thing is:".
		 * The `{placeholder without replacement}` doesn't have a replacement, so it will remain "{placeholder without replacement}".
		 */
		const turns = game.functions.util.getTraditionalTurnCounter();

		/*
		 * Here we use static placeholders. Static placeholders are placeholders that don't change.
		 * For example, `{laugh}` here is a static placeholder since you can just add `haha lol` to the description and it wouldn't change anything.
		 * The use of static placeholders is discouraged, but we'll use them for demonstration purposes.
		 *
		 * This should give us "Battlecry: Gain mana equal to the turn counter. (Currently x, haha lol, x, The next thing is: test, {placeholder without replacement})"
		 * where x is the turn counter.
		 */
		return {
			turns,
			laugh: "haha lol",
			test: "test",
			"next thing is": "The next thing is:",
		};
	},

	async test(owner, self) {
		await self.formatPlaceholders();

		assert.equal(
			self.text,
			"Battlecry: Gain mana equal to the turn counter. (Currently {ph:turns}, {ph:laugh}, {ph:turns}, {ph:next thing is} {ph:test}, {placeholder without replacement})",
		);

		assert.equal(
			await self.replacePlaceholders(),
			"Battlecry: Gain mana equal to the turn counter. (Currently 1, haha lol, 1, The next thing is: test, {placeholder without replacement})",
		);

		await game.endTurn();
		await game.endTurn();

		assert.equal(
			await self.replacePlaceholders(),
			"Battlecry: Gain mana equal to the turn counter. (Currently 2, haha lol, 2, The next thing is: test, {placeholder without replacement})",
		);
	},
};
