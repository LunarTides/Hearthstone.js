// Created by Hand

import {
	Ability,
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	type EventValue,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Event Listener Example",
	text: "Battlecry: For the rest of the game, your battlecries trigger twice.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 57,

	attack: 1,
	health: 1,
	tribe: MinionTribe.None,

	async battlecry(owner, self) {
		// For the rest of the game, your battlecries trigger twice.

		/*
		 * Event listeners behave exactly like passives, except they aren't tied to a card's location.
		 * It is important to destroy the event listener when you're done with it, which is why there are 3 ways for an event listener to be destroyed.
		 * For this example, the event listener lasts forever, so we won't destroy it.
		 */

		/*
		 * The first argument is the event key to listen for.
		 * The second argument is a callback function that gets called when the event key is triggered.
		 * The third argument is the event listeners' lifespan.
		 */
		const destroy = game.event.addListener(
			Event.PlayCard,
			async (_unknownValue, eventPlayer) => {
				// This function will be run when the correct event is broadcast.

				// addListener can't figure out the type of `val` by itself, so we have to do the same thing as with passives.
				const value = _unknownValue as EventValue<Event.PlayCard>;

				/*
				 * Only continue if the player that triggered the event is this card's owner and the played card is a minion and it is not this card.
				 * The `PlayCard` event gets triggered after this battlecry, remember? So we need to prevent it from calling this card's battlecry again.
				 * The return value will be explained below.
				 */
				if (
					value.type !== Type.Minion ||
					eventPlayer !== owner ||
					value === self
				) {
					return EventListenerMessage.Skip;
				}

				// Activate the battlecry
				await value.activate(Ability.Battlecry);

				/*
				 * You have to return a message to the event listener handler to tell it what to do next.
				 * If you return `Destroy`, the event listener gets destroyed (this is the same as running the `destroy` function).
				 * If you return `Reset`, the event listener's lifetime is reset to 1, resetting the event listeners age. This is rarely useful, but is an option.
				 * If you return `Skip`, this event does not count towards the event listeners lifetime.
				 * If you return `Success`, nothing happens. The event will count towards the event listeners lifetime. This is the most useful / default option.
				 */
				return EventListenerMessage.Success;
			},
			-1, // This number is how many times the callback function can run before the event listener self-destructs. If this is set to `-1`, it lasts forever.
		);

		// await destroy(); // Run this function to destroy the event listener
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};
