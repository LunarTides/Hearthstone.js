// Created by the Custom Card Creator

import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Tag,
	Type,
} from "@Game/types.ts";

export const blueprint: Blueprint = {
	name: "Galakrond, the Unspeakable",
	text: "<b>Battlecry:</b> Destroy {amount} random enemy {target}.",
	cost: 7,
	type: Type.Hero,
	classes: [Class.Priest],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [Tag.Galakrond],
	id: "019bc665-4f81-7020-aabb-f04f92da9e00",

	armor: 5,
	heropowerId: game.ids.Official.builtin.galakronds_wit[0],

	async battlecry(self, owner) {
		// Destroy 1 random enemy minion.
		const invokeCount = self.getStorage(self.uuid, "invokeCount") as
			| number
			| undefined;
		const amount = !invokeCount ? 0 : game.card.galakrondFormula(invokeCount);

		for (let i = 0; i < amount; i++) {
			// Get a random minion from the opponent's board.
			const board = owner.getOpponent().board;

			const minion = game.lodash.sample(board);
			if (!minion) {
				continue;
			}

			// Destroy it
			await minion.destroy();
		}
	},

	async invoke(self, owner) {
		self.galakrondBump("invokeCount");
	},

	async placeholders(self, owner) {
		const invokeCount = self.getStorage(self.uuid, "invokeCount") as
			| number
			| undefined;
		if (!invokeCount) {
			return { amount: 0, target: "minions" };
		}

		const amount = game.card.galakrondFormula(invokeCount);

		const multiple = amount !== 1;
		const target = multiple ? "minions" : "minion";

		return { amount, target };
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};
