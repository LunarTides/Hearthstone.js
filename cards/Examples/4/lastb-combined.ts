// Created by Hand

import {
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	QuestType,
	Rarity,
	SpellSchool,
	Tag,
	Type,
} from "@Game/types.ts";

// This is the big one
export const blueprint: Blueprint = {
	name: "Combined Example 4",
	text: "Quest: Play 3 cards. Reward: Reduce the cost of the next 10 Minions you play by 1.",
	cost: 1,
	type: Type.Spell,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: false,
	tags: [Tag.Quest],
	id: 60,

	spellSchools: [SpellSchool.None],

	async cast(self, owner) {
		await owner.addQuest(
			QuestType.Quest,
			self,
			Event.PlayCard,
			3,
			async (value, done) => {
				if (value === self) {
					return EventListenerMessage.Skip;
				}

				if (!done) {
					return EventListenerMessage.Success;
				}

				/*
				 * The quest is done.
				 * Add the enchantment constantly.
				 */
				const unhook = game.event.hookToTick(async () => {
					// Only add the enchantment to minions
					for (const minion of owner.hand.filter(
						(card) => card.type === Type.Minion,
					)) {
						if (
							minion.enchantmentExists(
								game.cardIds.combinedExample4Enchantment_147,
								self,
							)
						) {
							continue;
						}

						await minion.addEnchantment(
							game.cardIds.combinedExample4Enchantment_147,
							self,
						);
					}
				});

				// Add an event listener to check if you've played 10 cards
				let amount = 0;

				game.event.addListener(
					Event.PlayCard,
					async (value, eventPlayer) => {
						// Only continue if the player that triggered the event is this card's owner and the played card is a minion.
						if (eventPlayer !== owner || value.type !== Type.Minion) {
							return EventListenerMessage.Skip;
						}

						// Every time YOU play a MINION, increment `amount` by 1.
						amount++;

						// If `amount` is less than 10, don't do anything. Return true since it was a success.
						if (amount < 10) {
							return EventListenerMessage.Success;
						}

						// You have now played 10 minions

						// Destroy the tick hook
						unhook();

						/*
						 * Remove the enchantment.
						 * You don't need to filter the hand since `removeEnchantment` only removes the enchantment if they're there.
						 */
						for (const minion of owner.hand) {
							await minion.removeEnchantment(
								game.cardIds.combinedExample4Enchantment_147,
								self,
							);
						}

						// Destroy this event listener so it doesn't run again.
						return EventListenerMessage.Destroy;
					},
					-1, // The event listener shouldn't destruct on its own, and should only be manually destroyed.
				);

				// The quest event was a success. The game will remove this quest from the player.
				return EventListenerMessage.Success;
			},
		);
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};
