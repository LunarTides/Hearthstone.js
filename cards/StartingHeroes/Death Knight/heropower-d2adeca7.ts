// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.ts";
import assert from "node:assert";

export const blueprint: Blueprint = {
	name: "Ghoul Charge",
	text: "Summon a 1/1 Ghoul with Charge. It dies at end of turn.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.DeathKnight],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: "019bc665-4f82-7002-ad5c-d2adeca7ffd1",

	async heropower(self, owner) {
		// Summon a 1/1 Ghoul with Charge. It dies at end of turn.

		// Create the Ghoul
		const minion = await Card.create(
			game.cardIds.frailGhoul_019bc665_4f82_7003_b1c0_7f2dc33c14bc,
			owner,
		);

		// Summon the Ghoul
		await owner.summon(minion);

		// The `It dies at end of turn.` part is handled by the ghoul itself, so we don't need to do anything extra here
	},

	async test(self, owner) {
		const lookForMinion = () =>
			owner.board.some(
				(card) =>
					card.id ===
					game.cardIds.frailGhoul_019bc665_4f82_7003_b1c0_7f2dc33c14bc,
			);

		// The minion shouldn't be on the board at first.
		assert(!lookForMinion());
		await self.trigger(Ability.HeroPower);

		// The minion should now be on the board.
		assert(lookForMinion());
	},
};
