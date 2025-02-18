// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Game/card.js";
import {
	Ability,
	type Blueprint,
	Class,
	Rarity,
	TargetAlignment,
	TargetClass,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Prison of Yogg-Saron",
	text: "Choose a character. Cast 4 random spells <i>(targeting it if possible)</i>.",
	cost: 7,
	type: Type.Location,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: 102,

	durability: 3,
	cooldown: 2,

	async use(owner, self) {
		// Choose a character. Cast 4 random spells (targeting it if possible).
		const target = await game.functions.interact.prompt.target(
			self.text,
			self,
			TargetAlignment.Any,
			TargetClass.Any,
		);
		if (!target) {
			return Card.REFUND;
		}

		owner.forceTarget = target;

		const pool = (await Card.all()).filter((card) => card.type === Type.Spell);

		for (let i = 0; i < 4; i++) {
			const card = await game.lodash.sample(pool)?.imperfectCopy();
			if (!card) {
				continue;
			}

			await card.trigger(Ability.Cast);
		}

		owner.forceTarget = undefined;
		return true;
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};
