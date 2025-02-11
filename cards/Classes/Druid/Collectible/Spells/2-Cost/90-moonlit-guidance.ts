// Created by the Vanilla Card Creator

import assert from "node:assert";
import type { Blueprint, EventValue } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Moonlit Guidance",
	text: "<b>Discover</b> a copy of a card in your deck. If you play it this turn, draw the original.",
	cost: 2,
	type: "Spell",
	classes: ["Druid"],
	rarity: "Rare",
	collectible: true,
	tags: [],
	id: 90,

	spellSchool: "Arcane",

	async cast(owner, self) {
		// Discover a copy of a card in your deck. If you play it this turn, draw the original.
		const original = await game.functions.interact.promptDiscover(
			self.text,
			owner.deck,
			false,
		);
		if (!original) {
			return;
		}

		const card = await original.imperfectCopy();
		await owner.addToHand(card);

		// Wait for the player to play the card
		const destroy = game.event.addListener(
			"PlayCard",
			async (_unknownValue, eventPlayer) => {
				const value = _unknownValue as EventValue<"PlayCard">;

				if (value !== card) {
					return false;
				}

				await owner.drawSpecific(original);
				return true;
			},
		);

		// Destroy the event listener when the turn ends
		game.event.addListener("EndTurn", async () => destroy());
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};
