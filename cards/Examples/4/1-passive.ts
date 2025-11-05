// Created by Hand

import {
	Ability,
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.ts";

// Im sorry, things are about to become a lot more complicated from this point on.
export const blueprint: Blueprint = {
	name: "Passive Example",

	// This is our goal, remember that after this massive info-dump.
	text: "Your battlecries trigger twice.",

	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 55,

	attack: 1,
	health: 1,
	tribes: [MinionTribe.None],

	/*
	 * Note the new `key`, `value` and `eventPlayer` arguments.
	 * These are only used in the `passive`, `handPassive`, `tick`, and `handTick` abilities.
	 */
	async passive(self, owner, key, value, eventPlayer) {
		/*
		 * Your battlecries trigger twice.
		 * ^ In order to do this, we wait until a minion is played, then manually trigger its battlecry.
		 */

		/*
		 * The passive lasts as long as the minion is on the board. Use `handPassive` instead for the passive to last as long as the minion is in a hand.
		 * Whenever an event gets broadcast, this passive will be triggered with the key and value of that event.
		 * The card can then choose to only do something if the correct event was broadcast. (Using `game.event.is`)
		 */

		/*
		 * `key` is the key of the event. Look at the `Event` enum for all keys.
		 * `value` is some additional information about the event. The type of this variable is different for each `key`, so it's currently unknown.
		 * `eventPlayer` is the player that triggered the event.
		 *
		 * We want to execute code when a card gets played. There exists an event with the key `PlayCard` that does this.
		 * That event's value is the card that was played.
		 */

		/*
		 * When you play a minion, the `PlayCard` event is triggered after the minion's battlecry, in order for refunding to not trigger the event.
		 * `game.event.is` checks if the `key` is `Event.PlayCard`. It also narrows the type of `value`. After this line, `value` is type `Card`.
		 * We only want YOUR battlecries to trigger twice. (`eventPlayer` is the player that triggered the event)
		 */
		if (!game.event.is(key, value, Event.PlayCard) || eventPlayer !== owner) {
			return;
		}

		/*
		 * `value` is now the correct type for that key (in this case `Card`) since `game.event.is` helpfully narrows down the type.
		 * If I change the type of the event's value in the future, this will correctly cause an error instead of unexpected behavior.
		 */

		// We check if the card played is not a minion. (This is not neccessary in this case since if the card doesn't have a battlecry, `trigger` won't do anything, but it's here for clarity.)
		if (value.type !== Type.Minion) {
			return;
		}

		// We now now that a `PlayCard` event triggered, and the card played was a minion.

		/*
		 * Activate the battlecry of the minion.
		 * Remember, this passive triggers after the minion's battlecry in order to handle refunding.
		 * This means that once we trigger the battlecry here, the minion's battlecry will have triggered twice in total.
		 */
		await value.trigger(Ability.Battlecry);
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};
