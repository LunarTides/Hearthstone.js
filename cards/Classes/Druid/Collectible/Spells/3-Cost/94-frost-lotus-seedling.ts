// Created by the Vanilla Card Creator

import assert from "node:assert";
import {
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	Rarity,
	SpellSchool,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Frost Lotus Seedling",
	text: "{placeholder}",
	cost: 3,
	type: Type.Spell,
	classes: [Class.Druid],
	rarity: Rarity.Rare,
	collectible: true,
	tags: [],
	id: 94,

	spellSchools: [SpellSchool.Nature],

	async create(self, owner) {
		// Initialize storage
		self.storage.blossom = 0;
		self.storage.blossomed = false;
	},

	async passive(self, owner, key, value, eventPlayer) {
		// Increment blossom counter at the end of the owner's turn
		if (!game.event.is(key, value, Event.EndTurn) || eventPlayer !== owner) {
			return;
		}

		self.storage.blossom++;

		if (self.storage.blossom >= 3) {
			self.storage.blossomed = true;
		}
	},

	async cast(self, owner) {
		/*
		 * Draw {1|2} card{|s}. Gain {5|10} Armor.{ (Blossoms in 3 turns.)|}
		 *       ^ ^ Left side is if not blossomed, right side if blossomed
		 */
		const { blossomed } = self.storage;

		if (blossomed) {
			await owner.drawCards(2);
		} else {
			await owner.drawCards(1);
		}

		owner.addArmor(blossomed ? 10 : 5);
	},

	async condition(self, owner) {
		return Boolean(self.storage.blossomed);
	},

	async placeholders(self, owner) {
		const placeholder = self.storage.blossomed
			? "Draw 2 cards. Gain 10 Armor."
			: `Draw 1 card. Gain 5 Armor. <i>(Blossoms in ${3 - self.storage.blossom} turns.)</i>`;

		return { placeholder };
	},

	async test(self, owner) {
		// TODO: Add proper tests. #325
		return EventListenerMessage.Skip;
	},
};
