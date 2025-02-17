// Created by Hand

import type { Card } from "@Game/card.js";
import {
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	type EventValue,
	QuestType,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Quest Example",

	// The description doesn't need to look like this, it is just what Vanilla Hearthstone does, so we copy it here.
	text: "Quest: Play 3 cards. Reward: Return those cards back to your hand.",

	cost: 1,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 58,

	spellSchool: SpellSchool.None,

	async cast(owner, self) {
		// Quest: Play 3 cards. Reward: Return those cards back to your hand.

		// Create a list of cards to put the 3 cards into
		const cards: Card[] = [];

		/*
		 * AddQuest(
		 *     type of quest,
		 *     the card that created the quest,
		 *     the key of the event to listen to,
		 *     the amount of times that event has to be broadcast for the quest to be considered done,
		 *     the function to run for each event broadcast: Function(
		 *         value of the event,
		 *         if the quest is considered done,
		 *     ) -> a message to deliver to the event manager
		 * );
		 */
		await owner.addQuest(
			QuestType.Quest,
			self,
			Event.PlayCard,
			3,
			async (_unknownValue, done) => {
				/*
				 * This code runs every time the `PlayCard` event gets broadcast.
				 * This is like the callback function in event listeners.
				 */

				// Get the value of the event
				const value = _unknownValue as EventValue<Event.PlayCard>;

				/*
				 * Returning false will prevent this event from counting towards the quest
				 * If the card played was this card, it doesn't count towards this quest.
				 */

				/*
				 * The `PlayCard` event gets triggered after the text of the card played.
				 * That means when you play this card, the quest gets added, then the `PlayCard` event gets broadcast,
				 * which triggers this quest. So we need to prevent that event from counting towards the quest.
				 */
				if (value === self) {
					return EventListenerMessage.Skip;
				}

				// Otherwise, add it to the cards array, and count it.
				cards.push(value);

				/*
				 * Return true to count this event towards the quest
				 * Only return if the quest isn't considered done. It is considered done if the quest has been triggered enough times (in this case 3).
				 */
				if (!done) {
					return EventListenerMessage.Success;
				}

				// The quest is done. The code above has been triggered 3 times in total.

				// Go through the list of cards that was played, and add them back to the player's hand
				for (const playedCard of cards) {
					/*
					 * Create an imperfect copy of the card.
					 * This is what hearthstone does when a card gets bounced back to a player's hand, for example.
					 * This puts the card back to its original state. Defined by this blueprint.
					 *
					 * This also prevents cards from being `linked`. If two cards are linked, anything that happens to one of them will happen to the other.
					 * If you don't want the card to be reset, but you want to avoid it being linked, use `perfectCopy`
					 * If we were to do `owner.addToHand(playedCard)`, the card added to the player's hand would be (most likely) linked to the original card.
					 */
					const card = await playedCard.imperfectCopy();

					// Add the imperfect copy of the card to the player's hand
					await owner.addToHand(card);
				}

				/*
				 * Return `Success` to count this event towards the quest
				 * This finishes the quest
				 */
				return EventListenerMessage.Success;
			},
			// Put the id of a spell here to make a questline. When the quest gets completed, a card with that id gets created and the game immediately activates its cast ability.
		);
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};
