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
	id: "f9e328c6-9195-4de0-a14d-02f797d0f3ba",

	async heropower(self, owner) {
		// Summon a 1/1 Ghoul with Charge. It dies at end of turn.

		// Create the Ghoul
		const minion = await Card.create(
			game.cardIds.frailGhoul_4ed9bfc1_90f5_417a_b72a_002812cc688d,
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
					game.cardIds.frailGhoul_4ed9bfc1_90f5_417a_b72a_002812cc688d,
			);

		// The minion shouldn't be on the board at first.
		assert(!lookForMinion());
		await self.trigger(Ability.HeroPower);

		// The minion should now be on the board.
		assert(lookForMinion());
	},
};
