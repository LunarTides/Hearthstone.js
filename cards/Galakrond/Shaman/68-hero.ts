// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	CardTag,
	Class,
	EventListenerMessage,
	Rarity,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Galakrond, the Tempest",
	text: "<b>Battlecry:</b> Summon two {amount}/{amount} Storms with <b>Rush</b>.{weapon}",
	cost: 7,
	type: Type.Hero,
	classes: [Class.Shaman],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [CardTag.Galakrond],
	id: 68,

	armor: 5,
	heropowerId: game.cardIds.galakrondsFury126,

	async battlecry(self, owner) {
		// Summon two 1/1 Storms with Rush. (Equip a 5/2 Claw.)

		// Get the stats
		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);

		const shouldGiveWeapon = amount >= 7;

		// Summon the two minions
		for (let i = 0; i < 2; i++) {
			const minion = await Card.create(game.cardIds.brewingStorm112, owner);
			if (!minion) {
				break;
			}

			await minion.setStats(amount, amount);
			await owner.summon(minion);
		}

		if (!shouldGiveWeapon) {
			return;
		}

		// Give the weapon
		const weapon = await Card.create(game.cardIds.dragonClaw111, owner);
		await owner.setWeapon(weapon);
	},

	async invoke(self, owner) {
		self.galakrondBump("invokeCount");
	},

	async placeholders(self, owner) {
		if (!self.storage.invokeCount) {
			return { amount: 0, plural: "s", plural2: "They" };
		}

		const amount = game.functions.card.galakrondFormula(
			self.storage.invokeCount as number,
		);

		const weapon = amount >= 7 ? " Equip a 5/2 Claw." : "";

		return { amount, weapon };
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};
