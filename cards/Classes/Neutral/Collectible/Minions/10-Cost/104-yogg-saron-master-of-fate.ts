// Created by the Vanilla Card Creator

import assert from "node:assert";
import { Card } from "@Core/card.js";
import { Player } from "@Core/player.js";
import {
	Ability,
	type Blueprint,
	Class,
	Event,
	EventListenerMessage,
	Keyword,
	MinionTribe,
	Rarity,
	Type,
} from "@Game/types.js";

export const blueprint: Blueprint = {
	name: "Yogg-Saron, Master of Fate",
	text: "<b>Battlecry:</b> If you've cast 10 spells this game, spin the Wheel of Yogg-Saron.{left}",
	cost: 10,
	type: Type.Minion,
	classes: [Class.Neutral],
	rarity: Rarity.Legendary,
	collectible: true,
	tags: [],
	id: 104,

	attack: 7,
	health: 5,
	tribe: MinionTribe.None,

	async battlecry(owner, self) {
		// If you've cast 10 spells this game, spin the Wheel of Yogg-Saron. ({amount} left!)
		if (!(await self.condition())) {
			return;
		}

		const choices = [
			"Curse of Flesh",
			"Devouring Hunger",
			"Hand of Fate",
			"Mindflayer Goggles",
			"Mysterybox",
			"Rod of Roasting",
		];

		const choice = game.lodash.sample(choices);
		if (!choice) {
			throw new Error("No choice found");
		}

		const pool = await Card.all();

		const minionPool = pool.filter((card) => card.type === Type.Minion);
		const spellPool = pool.filter((card) => card.type === Type.Spell);

		switch (choice) {
			case "Curse of Flesh": {
				// Fill the board with random minions, then give yours Rush.
				for (let id = 0; id < 2; id++) {
					const player = Player.fromID(id);

					// Subtract to account for yogg-saron being on the board
					const remaining =
						player.getRemainingBoardSpace() - (player === owner ? 1 : 0);

					for (let index = 0; index < remaining; index++) {
						const card = await game.lodash.sample(minionPool)?.imperfectCopy();
						if (!card) {
							continue;
						}

						if (player === owner) {
							card.addKeyword(Keyword.Rush);
						}

						await player.summon(card);
					}
				}

				break;
			}

			case "Devouring Hunger": {
				// Destroy all other minions. Gain their Attack and Health.
				for (const player of [game.player1, game.player2]) {
					for (const card of player.board) {
						if (card === self) {
							continue;
						}

						await card.kill();
						await self.addStats(card.attack, card.health);
					}
				}

				break;
			}

			case "Hand of Fate": {
				// Fill your hand with random spells. They cost (0) this turn.
				const remaining = owner.getRemainingHandSpace();

				for (let index = 0; index < remaining; index++) {
					const card = await game.lodash.sample(spellPool)?.imperfectCopy();
					if (!card) {
						continue;
					}

					card.addEnchantment("cost = 0", self);
					await owner.addToHand(card);
				}

				game.event.addListener(Event.EndTurn, async () => {
					for (const card of owner.hand) {
						card.removeEnchantment("cost = 0", self);
					}

					return EventListenerMessage.Destroy;
				});

				break;
			}

			case "Mindflayer Goggles": {
				// Take control of three random enemy minions.
				const board = owner.getOpponent().board;

				for (let index = 0; index < 3; index++) {
					const card = game.lodash.sample(board);
					if (!card) {
						continue;
					}

					await card.takeControl(owner);
				}

				break;
			}

			case "Mysterybox": {
				// Cast a random spell for every spell you've cast this game (targets chosen randomly).
				const oldYogg = await Card.create(
					game.cardIds.yoggSaronHopesEnd103,
					owner,
				);
				await oldYogg.activate(Ability.Battlecry);

				break;
			}

			case "Rod of Roasting": {
				// Cast 'Pyroblast' randomly until a hero dies.
				const rod = await Card.create(game.cardIds.pyroblast105, owner);

				while (game.player1.isAlive() && game.player2.isAlive()) {
					owner.forceTarget = game.functions.util.getRandomTarget();
					await rod.activate(Ability.Cast);
				}

				owner.forceTarget = undefined;

				break;
			}

			// No default
		}

		await game.event.broadcast(Event.CardEvent, [self, choice], owner);
	},

	async placeholders(owner, self) {
		const amount = game.event.events.PlayCard?.[owner.id].filter(
			(object) => object[0] instanceof Card && object[0].type === Type.Spell,
		).length;
		if (!amount) {
			return { left: " <i>(10 left!)</i>" };
		}

		if (amount >= 10) {
			return { left: "" };
		}

		return { left: ` <i>(${10 - amount} left!)</i>` };
	},

	async condition(owner, self) {
		const amount = game.event.events.PlayCard?.[owner.id].filter(
			(object) => object[0] instanceof Card && object[0].type === Type.Spell,
		).length;
		if (!amount) {
			return false;
		}

		return amount >= 10;
	},

	async test(owner, self) {
		// TODO: Add proper tests. #325
		return true;
	},
};
