// Created by Hand

import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Remove Conditionally Example",
	text: "<b>Battlecry:</b> Ask if it's okay to use networking. If not, refund this card and remove it from play.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019e5a5c-1855-700a-954f-5437491bde27",

	attack: 1,
	health: 1,
	tribes: [],

	async battlecry(self, owner) {
		// Ask if it's okay to use networking. If not, refund this card and remove it from play.
		// IMAGINE! You check `game.config.networking.allow.packs`, and it returns false. What do you do?!
		// Let me show you:

		const networkingAllowed = await game.prompt.yesNo(
			"Are we allowed to use networking?",
			owner,
		);
		if (!networkingAllowed) {
			// Uh oh! We're not allowed to use networking!

			// First, show feedback to the user to prevent confusion.
			console.log(
				"<yellow>Networking access denied. This card needs networking permissions to work properly.</yellow>",
			);
			await game.pause();

			// Second, we need to remove the card from the game, so that the player doesn't just have it in their hand forever.
			// We listen for the `CancelCard` event.
			game.event.addListener(
				Event.CancelCard,
				async ([card, ability]) => {
					// If this card is the cancelled card, remove it from play and destroy the event listener.
					if (card === self) {
						await card.removeFromPlay();
						return EventListenerMessage.Destroy;
					}

					return EventListenerMessage.Success;
				},
				-1,
			);

			// Third, we refund the mana cost, and make sure no "PlayCard" event listeners trigger.
			// The above event listener will trigger when the game handles this refund request.
			return Card.REFUND;
		}

		// All good!
		// Stop typescript from complaining about not all code paths returning a value.
		return true;
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};
