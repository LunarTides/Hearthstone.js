// Created by the Custom Card Creator

import { Card } from "@Game/card.ts";
import {
	type Blueprint,
	Class,
	EventListenerMessage,
	Rarity,
	Tag,
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
	tags: [Tag.Galakrond],
	id: "019bc665-4f81-700b-8ff5-07c9242e3140",

	armor: 5,
	heropowerId: game.cardIds.galakrondsFury_019bc665_4f81_700a_bd27_2600dc1b8cb1,

	async battlecry(self, owner) {
		// Summon two 1/1 Storms with Rush. (Equip a 5/2 Claw.)

		// Get the stats
		const amount = game.functions.card.galakrondFormula(
			self.getStorage(self.uuid, "invokeCount") as number,
		);

		const shouldGiveWeapon = amount >= 7;

		// Summon the two minions
		for (let i = 0; i < 2; i++) {
			const minion = await Card.create(
				game.cardIds.brewingStorm_019bc665_4f7f_7009_b00f_7522b1557a9f,
				owner,
			);
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
		const weapon = await Card.create(
			game.cardIds.dragonClaw_019bc665_4f7f_700a_96cc_118bbb61d378,
			owner,
		);
		await owner.setWeapon(weapon);
	},

	async invoke(self, owner) {
		self.galakrondBump("invokeCount");
	},

	async placeholders(self, owner) {
		const invokeCount = self.getStorage(self.uuid, "invokeCount");

		if (!invokeCount) {
			return { amount: 0, plural: "s", plural2: "They" };
		}

		const amount = game.functions.card.galakrondFormula(invokeCount);
		const weapon = amount >= 7 ? " Equip a 5/2 Claw." : "";

		return { amount, weapon };
	},

	async test(self, owner) {
		// TODO: Test. #325
		return EventListenerMessage.Skip;
	},
};
