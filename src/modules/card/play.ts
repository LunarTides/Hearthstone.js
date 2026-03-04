import { Card } from "@Game/card.ts";
import type { Player } from "@Game/player.ts";
import {
	Ability,
	Alignment,
	Event,
	GamePlayCardReturn,
	Keyword,
	Tribe,
} from "@Game/types.ts";

export const playCard = {
	/**
	 * Play a card
	 *
	 * @param card The card to play
	 * @param player The card's owner
	 */
	async play(card: Card, player: Player): Promise<GamePlayCardReturn> {
		game.event.newHistoryChild(Event.PlayCard, card, player);

		// Forge
		const forge = await playCard._forge(card, player);
		if (forge !== GamePlayCardReturn.Invalid) {
			return forge;
		}

		// Trade
		const trade = await playCard._trade(card, player);
		if (trade !== GamePlayCardReturn.Invalid) {
			return trade;
		}

		// Cost
		if (player[card.costType] < card.cost) {
			return GamePlayCardReturn.Cost;
		}

		// If the board has max capacity, and the card played is a minion or location card, prevent it.
		if (!(await playCard._hasCapacity(card, player))) {
			return GamePlayCardReturn.Space;
		}

		// Condition
		if (!(await playCard._condition(card, player))) {
			return GamePlayCardReturn.Refund;
		}

		// Charge you for the card
		player[card.costType] -= card.cost;
		await game.event.withSuppressed(Event.DiscardCard, async () =>
			card.discard(),
		);

		// Counter
		if (playCard._countered(card, player)) {
			return GamePlayCardReturn.Counter;
		}

		// Broadcast `PlayCardUnsafe` event without adding it to the history
		await game.event.broadcast(Event.PlayCardUnsafe, card, player, false);

		// Finale
		if (player[card.costType] === 0) {
			await card.trigger(Ability.Finale);
		}

		// Store the result of the type-specific code
		let result: GamePlayCardReturn = GamePlayCardReturn.Success;

		/*
		 * Type specific code
		 * HACK: Use of never
		 */
		const typeFunction: (
			card: Card,
			player: Player,
		) => Promise<GamePlayCardReturn> =
			playCard.typeSpecific[card.type as never];

		if (!typeFunction) {
			throw new TypeError(`Cannot handle playing card of type: ${card.type}`);
		}

		result = await typeFunction(card, player);

		// Refund
		if (result === GamePlayCardReturn.Refund) {
			return result;
		}

		card.turnPlayed = game.turn;

		// Add the `PlayCardUnsafe` event to the history, now that it's safe to do so
		game.event.addHistory(Event.PlayCardUnsafe, card, player);

		await playCard._echo(card, player);
		await playCard._combo(card, player);
		await playCard._corrupt(card, player);

		// Broadcast `PlayCard` event
		await game.event.broadcast(Event.PlayCard, card, player);
		return result;
	},

	// Card type specific code
	typeSpecific: {
		async Minion(card: Card, player: Player): Promise<GamePlayCardReturn> {
			// Magnetize
			if (await playCard._magnetize(card, player)) {
				return GamePlayCardReturn.Magnetize;
			}

			if (
				!card.hasKeyword(Keyword.Dormant) &&
				(await card.trigger(Ability.Battlecry)) === Card.REFUND
			) {
				return GamePlayCardReturn.Refund;
			}

			return game.event.withSuppressed(Event.SummonCard, async () =>
				player.summon(card),
			);
		},

		async Spell(card: Card, player: Player): Promise<GamePlayCardReturn> {
			if ((await card.trigger(Ability.Cast)) === Card.REFUND) {
				return GamePlayCardReturn.Refund;
			}

			// Twinspell functionality
			if (card.hasKeyword(Keyword.Twinspell)) {
				card.removeKeyword(Keyword.Twinspell);
				card.text = card.text.split("Twinspell")[0].trim();

				await player.addToHand(card);
			}

			// Spellburst functionality
			for (const card of player.board) {
				await card.trigger(Ability.Spellburst);
				card.abilities.spellburst = undefined;
			}

			return GamePlayCardReturn.Success;
		},

		async Weapon(card: Card, player: Player): Promise<GamePlayCardReturn> {
			if ((await card.trigger(Ability.Battlecry)) === Card.REFUND) {
				return GamePlayCardReturn.Refund;
			}

			await player.setWeapon(card);
			return GamePlayCardReturn.Success;
		},

		async Hero(card: Card, player: Player): Promise<GamePlayCardReturn> {
			if ((await card.trigger(Ability.Battlecry)) === Card.REFUND) {
				return GamePlayCardReturn.Refund;
			}

			await player.setHero(card);
			return GamePlayCardReturn.Success;
		},

		async Location(card: Card, player: Player): Promise<GamePlayCardReturn> {
			await card.setStats(0, card.health);
			card.addKeyword(Keyword.Immune);
			card.cooldown = 0;

			return game.event.withSuppressed(Event.SummonCard, async () =>
				player.summon(card),
			);
		},

		async HeroPower(card: Card, player: Player): Promise<GamePlayCardReturn> {
			// A hero power card shouldn't really be played, but oh well.
			player.hero.heropowerId = card.id;
			player.hero.heropower = card;

			return GamePlayCardReturn.Success;
		},

		async Enchantment(card: Card, player: Player): Promise<GamePlayCardReturn> {
			// I don't *really* know how you would be able to play an enchantment, but ok.
			// I can't really think if anything specific it should do, so...
			return GamePlayCardReturn.Success;
		},
	},

	async _trade(card: Card, player: Player): Promise<GamePlayCardReturn> {
		if (!card.hasKeyword(Keyword.Tradeable)) {
			return GamePlayCardReturn.Invalid;
		}

		let q: boolean;

		if (player.ai) {
			q = await player.ai.trade(card);
		} else {
			await game.interact.print.gameState(player);
			q = await game.prompt.yesNo(
				`Would you like to trade ${card.colorFromRarity()} for a random card in your deck?`,
				player,
			);
		}

		if (!q) {
			return GamePlayCardReturn.Invalid;
		}

		if (player.mana < 1) {
			return GamePlayCardReturn.Cost;
		}

		if (player.hand.length >= game.config.general.maxHandLength) {
			return GamePlayCardReturn.Space;
		}

		if (player.deck.length <= 0) {
			return GamePlayCardReturn.Space;
		}

		player.mana -= 1;

		await game.event.withSuppressed(Event.DiscardCard, async () =>
			card.discard(),
		);
		await player.drawCards(1);
		await player.shuffleIntoDeck(card);

		await game.event.broadcast(Event.TradeCard, card, player);
		return GamePlayCardReturn.Success;
	},

	async _forge(card: Card, player: Player): Promise<GamePlayCardReturn> {
		const forgeId = card.getKeyword(Keyword.Forge) as string | undefined;

		if (!forgeId) {
			return GamePlayCardReturn.Invalid;
		}

		let q: boolean;

		if (player.ai) {
			q = await player.ai.forge(card);
		} else {
			await game.interact.print.gameState(player);
			q = await game.prompt.yesNo(
				`Would you like to forge ${card.colorFromRarity()}?`,
				player,
			);
		}

		if (!q) {
			return GamePlayCardReturn.Invalid;
		}

		if (player.mana < 2) {
			return GamePlayCardReturn.Cost;
		}

		player.mana -= 2;

		await game.event.withSuppressed(Event.DiscardCard, async () =>
			card.discard(),
		);
		const forged = await Card.create(forgeId, player);
		await player.addToHand(forged);

		await game.event.broadcast(Event.ForgeCard, card, player);
		return GamePlayCardReturn.Success;
	},

	async _hasCapacity(card: Card, player: Player): Promise<boolean> {
		// Cards that aren't summoned to the board bypass this condition.
		// This is so that you can play, for example, spells while the board is full.
		if (!card.canBeOnBoard()) {
			return true;
		}

		return player.board.length < game.config.general.maxBoardSpace;
	},

	async _condition(card: Card, player: Player): Promise<boolean> {
		const condition = await card.trigger(Ability.Condition);
		if (!Array.isArray(condition)) {
			return true;
		}

		// This is if the condition is cleared
		const cleared = !condition.includes(false);
		if (cleared) {
			return true;
		}

		// Warn the user that the condition is not fulfilled
		const warnMessage =
			"<yellow>WARNING: This card's condition is not fulfilled. Are you sure you want to play this card?</yellow>";

		await game.interact.print.gameState(player);
		const warn = await game.prompt.yesNo(warnMessage, player);

		if (!warn) {
			return false;
		}

		return true;
	},

	_countered(card: Card, player: Player): boolean {
		const opponent = player.getOpponent();

		// Check if the card is countered
		if (opponent.counter?.includes(card.type)) {
			game.data.remove(opponent.counter, card.type);
			return true;
		}

		return false;
	},

	async _echo(card: Card, player: Player): Promise<boolean> {
		if (!card.hasKeyword(Keyword.Echo)) {
			return false;
		}

		// Create an exact copy of the card played
		const echo = card.perfectCopy();
		echo.addKeyword(Keyword.Echo);

		await player.addToHand(echo);
		return true;
	},

	async _combo(card: Card, player: Player): Promise<boolean> {
		const playedCards = player.getPlayedCards();
		if (playedCards.length <= 0) {
			return false;
		}

		// Get the player's PlayCard event history
		const latest = game.lodash.last(playedCards);
		if (!latest) {
			return false;
		}

		// If the previous card played was played on the same turn as this one, activate combo
		if (latest.turnCreated === game.turn) {
			await card.trigger(Ability.Combo);
		}

		return true;
	},

	async _corrupt(card: Card, player: Player): Promise<boolean> {
		for (const toCorrupt of player.hand) {
			const corruptId = toCorrupt.getKeyword(Keyword.Corrupt) as
				| string
				| undefined;
			if (!corruptId || card.cost <= toCorrupt.cost) {
				continue;
			}

			// Corrupt that card
			const corrupted = await Card.create(corruptId, player);

			await game.event.withSuppressed(Event.DiscardCard, async () =>
				card.discard(),
			);
			await game.event.withSuppressed(Event.AddCardToHand, async () =>
				player.addToHand(corrupted),
			);
		}

		return true;
	},

	async _magnetize(card: Card, player: Player): Promise<boolean> {
		const board = player.board;

		if (!card.hasKeyword(Keyword.Magnetic) || board.length <= 0) {
			return false;
		}

		// Find the mechs on the board
		const mechs = board.filter((m) => m.tribes?.includes(Tribe.Mech));
		if (mechs.length <= 0) {
			return false;
		}

		const mech = await game.prompt.targetCard(
			"Which minion do you want this card to Magnetize to:",
			undefined,
			{ alignment: Alignment.Friendly },
		);

		if (!mech) {
			return false;
		}

		if (!mech.tribes?.includes(Tribe.Mech)) {
			console.log("That minion is not a Mech.");
			return playCard._magnetize(card, player);
		}

		await mech.addStats(card.attack, card.health);

		for (const entry of Object.entries(card.keywords)) {
			mech.addKeyword(entry[0] as unknown as Keyword, entry[1]);
		}

		if (mech.maxHealth && card.maxHealth) {
			mech.maxHealth += card.maxHealth;
		}

		// Transfer the abilities over.
		for (const entry of Object.entries(card.abilities)) {
			const [key, value] = entry;

			for (const ability of value) {
				mech.addAbility(key as Ability, ability);
			}
		}

		// Echo
		await playCard._echo(card, player);

		// Corrupt
		await playCard._corrupt(card, player);

		return true;
	},
};
