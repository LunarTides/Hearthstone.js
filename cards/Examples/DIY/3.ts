// Created by Hand

import { Card } from "@Core/card.js";
import {
	type Blueprint,
	CardTag,
	Class,
	Event,
	EventListenerMessage,
	type EventValue,
	Rarity,
	SpellSchool,
	TargetAlignment,
	TargetClass,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "DIY 3",
	text: "<b>This is a DIY card, it does not work by default.</b> Choose a minion to kill.",
	cost: 0,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [CardTag.DIY],
	id: 63,

	spellSchool: SpellSchool.None,

	async cast(owner, self) {
		// Choose a minion to kill.

		/*
		 * Try to:
		 * 1. Ask the user which minion to kill.
		 * 2. Kill that minion
		 */

		/**
		 * Put all your code inside this function please.
		 */
		function solution() {
			// Put all your code inside this function please.
		}

		/*
		 * -----------------------------------------
		 * | DON'T CHANGE ANYTHING BELOW THIS LINE |
		 * -----------------------------------------
		 *
		 * There are also some spoilers about the solution in the verification process down below,
		 * so if you don't want to see it, don't scroll down
		 */

		/*
		 * Testing your solution.
		 * TODO: All this code is bad. Please fix it. #330
		 */
		let target = self;
		let correctParameters = false;
		let potentiallyCancelled = false;

		// Make sure the parameters are correct
		game.event.addListener(
			Event.TargetSelectionStarts,
			async (_unknownValue) => {
				const value = _unknownValue as EventValue<Event.TargetSelectionStarts>;

				// Don't check for `prompt` since there is no correct prompt
				const [prompt, card, forceSide, forceClass, flags] = value;

				correctParameters =
					card === self &&
					forceSide === TargetAlignment.Any &&
					forceClass === TargetClass.Card &&
					flags.length === 0;

				// The `TargetSelectionStarts` event fired. This means that the card has a chance of being cancelled.
				potentiallyCancelled = true;

				return EventListenerMessage.Destroy;
			},
			1,
		);

		// Find the target
		game.event.addListener(
			Event.TargetSelected,
			async (_unknownValue) => {
				const value = _unknownValue as EventValue<Event.TargetSelected>;

				if (value[0] !== self) {
					return EventListenerMessage.Ignore;
				}

				// At this point we know that the card wasn't cancelled, since the `TargetSelected` event doesn't fire if the card is cancelled
				target = value[1] as Card;
				potentiallyCancelled = false;

				return EventListenerMessage.Destroy;
			},
			1,
		);

		solution();

		/*
		 * This only happens if the `TargetSelectionStarts` event fired, but not `TargetSelected`.
		 * That only happens if the card was cancelled after the `TargetSelectionStarts` event fired
		 */
		if (potentiallyCancelled) {
			await game.pause(
				"You cancelled the card. The verification process depends on a minion actually being killed. Try again.\n",
			);

			return Card.REFUND;
		}

		const solved =
			target !== self &&
			Boolean(target.health) &&
			!target.isAlive() &&
			correctParameters &&
			(game.player1.graveyard.includes(target) ||
				game.player2.graveyard.includes(target));

		await game.functions.card.verifyDiySolution(solved, self);

		return true;
	},
};
