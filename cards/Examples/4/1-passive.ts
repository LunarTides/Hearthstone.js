// Created by Hand

import {
	Ability,
	type Blueprint,
	Class,
	Event,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

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
	 * These are only used in the `passive`, `handpassive`, `tick`, and `handtick` abilities.
	 */
	async passive(owner, self, key, value, eventPlayer) {
		/*
		 * Your battlecries trigger twice.
		 * ^ In order to do this, we wait until a minion is played, then manually trigger its battlecry.
		 */

		/*
		 * The passive lasts as long as the minion is on the board. Use `handpassive` instead for the passive to last as long as the minion is in a hand.
		 * Whenever an event gets broadcast, this passive will be triggered with the key and value of that event.
		 * The card can then choose to only do something if the correct event was broadcast. (By checking the value of `key`)
		 */

		/*
		 * `key` is the key of the event. Look in `src/types.ts` > `EventKey` type for all keys.
		 * `eventPlayer` is the player that triggered the event.
		 * `value` is some additional information about the event. The type of this variable is different for each `key`, so it's currently unknown.
		 * We will narrow the type of `value` once we know what `key` is.
		 *
		 * We want to execute code when a card gets played. There exists an event with the key `PlayCard` that does this.
		 * That event's value is the card played (type `Card`).
		 */

		/*
		 * When you play a minion, the `PlayCard` event is triggered after the minion's battlecry, in order for refunding to not trigger the event.
		 * We don't refund here, since refunding from passives is not supported, and currently doesn't do anything.
		 * We only want YOUR battlecries to trigger twice. (`eventPlayer` is the player that triggered the event)
		 */
		if (!game.event.is(key, value, Event.PlayCard) || eventPlayer !== owner) {
			return;
		}

		/*
		 * `value` is now the correct type for that key (in this case `Card`) since `game.event.is` helpfully narrows down the type of `value`.
		 * If I change the event's value in the future, this will correctly cause an error instead of unexpected behavior.
		 */

		// We check if the card played is not a minion (this is not neccessary in this case since if the card doesn't have a battlecry, it won't do anything, but it is here for clarity)
		if (value.type !== Type.Minion) {
			return;
		}

		// We now now that a `PlayCard` event triggered, and the card played was a minion.

		/*
		 * Activate the battlecry of the minion.
		 * Remember, this passive triggers after the minion's battlecry (in order to handle refunding).
		 * This means that once we trigger the battlecry here, the minion's battlecry will have triggered twice in total.
		 */
		await value.activate(Ability.Battlecry);
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};
