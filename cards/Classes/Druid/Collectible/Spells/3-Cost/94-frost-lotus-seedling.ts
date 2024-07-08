// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Frost Lotus Seedling",
	text: "{placeholder}",
	cost: 3,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Rare",
	collectible: true,
	id: 94,

	spellSchool: "Nature",

	create(owner, self) {
		// Initialize storage
		self.storage.blossom = 0;
		self.storage.blossomed = false;
	},

	passive(owner, self, key, _unknownValue, eventPlayer) {
		// Increment blossom counter at the end of the owner's turn
		if (!(key === "EndTurn" && eventPlayer === owner)) {
			return;
		}

		self.storage.blossom++;

		if (self.storage.blossom >= 3) {
			self.storage.blossomed = true;
		}
	},

	cast(owner, self) {
		/*
		 * Draw {1|2} card{|s}. Gain {5|10} Armor.{ (Blossoms in 3 turns.)|}
		 *       ^ ^ Left side is if not blossomed, right side if blossomed
		 */
		const { blossomed } = self.storage;

		if (blossomed) {
			owner.drawCards(2);
		} else {
			owner.drawCards(1);
		}

		owner.addArmor(blossomed ? 10 : 5);
	},

	condition(owner, self) {
		return Boolean(self.storage.blossomed);
	},

	placeholders(owner, self) {
		const placeholder = self.storage.blossomed
			? "Draw 2 cards. Gain 10 Armor."
			: `Draw 1 card. Gain 5 Armor. <i>(Blossoms in ${3 - self.storage.blossom} turns.)</i>`;

		return { placeholder };
	},

	test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};
