// Created by the Custom Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import { Ability, type Blueprint, Class, Rarity, Type } from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Ghoul Charge",
	text: "Summon a 1/1 Ghoul with Charge. It dies at end of turn.",
	cost: 2,
	type: Type.HeroPower,
	classes: [Class.DeathKnight],
	rarity: Rarity.Free,
	collectible: false,
	tags: [],
	id: 124,

	async heropower(owner, self) {
		// Summon a 1/1 Ghoul with Charge. It dies at end of turn.

		// Create the Ghoul
		const minion = await Card.create(game.cardIds.frailGhoul23, owner);

		// Summon the Ghoul
		await owner.summon(minion);

		// The `It dies at end of turn.` part is handled by the ghoul itself, so we don't need to do anything extra here
	},

	async test(owner, self) {
		const lookForMinion = () => owner.board.some((card) => card.id === 23);

		// The minion shouldn't be on the board at first.
		assert(!lookForMinion());
		await self.activate(Ability.HeroPower);

		// The minion should now be on the board.
		assert(lookForMinion());
	},
};
