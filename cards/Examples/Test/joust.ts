// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Tribe,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Joust Test",
	text: "<b>Battlecry:</b> Reveal a minion from each player's deck. If yours costs more, gain +1/+1.",
	cost: 1,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 139,

	attack: 1,
	health: 1,
	tribes: [Tribe.None],

	async battlecry(self, owner) {
		// Reveal a minion from each player's deck. If yours costs more, gain +1/+1.

		// Joust. Only allow minion cards to be selected
		const win = await owner.joust((card) => card.type === Type.Minion);

		if (!win) {
			return;
		}

		await self.addStats(1, 1);
	},

	async test(self, owner) {
		// TODO: Test #325
		return EventListenerMessage.Skip;
	},
};
