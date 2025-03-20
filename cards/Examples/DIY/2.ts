// Created by Hand

import {
	type Blueprint,
	CardTag,
	Class,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "DIY 2",
	text: "<b>This is a DIY card, it does not work by default.</b> Restore 3 health to your hero.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.DIY],
	id: 62,

	spellSchools: [SpellSchool.None],

	async cast(owner, self) {
		// Restore 3 health to the hero.

		// Try to heal the player by 3 hp.

		/*
		 * This is in a function so i can unit test it
		 * This is to make sure you got the right solution, since otherwise it can cause bugs
		 */

		/**
		 * Put all your code in this function please
		 */
		function solution() {
			// Put all your code in this function please
		}

		/*
		 * -----------------------------------------
		 * | DON'T CHANGE ANYTHING BELOW THIS LINE |
		 * -----------------------------------------
		 *
		 * There are also some spoilers about the solution in the verification process down below,
		 * so if you don't want to see it, don't scroll down
		 */

		// Testing your solution.
		let solved = true;

		const trueOgHealth = owner.health;

		// Restore 3 health when the player has 5 less than max health
		owner.health = owner.maxHealth - 5;
		let ogHealth = owner.health;

		solution();

		solved = solved && owner.health === ogHealth + 3;

		// Restore to max health when the player has 1 less than max health
		owner.health = owner.maxHealth - 1;
		ogHealth = owner.health;

		solution();

		solved = solved && owner.health === owner.maxHealth;

		owner.health = trueOgHealth;

		await game.functions.card.verifyDiySolution(solved, self);

		return true;
	},
};
