import { AI } from "@Game/ai.ts";
import { Card } from "@Game/card.ts";
import { eventManager } from "@Game/event.ts";
import { functions } from "@Game/functions/index.ts";
import { Player } from "@Game/player.ts";
import {
	Ability,
	Alignment,
	type Blueprint,
	Event,
	type GameAttackFlags,
	GameAttackReturn,
	type GameConfig,
	GamePlayCardReturn,
	Keyword,
	Location,
	RemoveReason,
	Tag,
	type Target,
	Tribe,
	Type,
} from "@Game/types.ts";
import { format } from "node:util";
import _ from "lodash";
import cardIds from "../cards/ids.ts";

const attack = {
	/**
	 * Makes a minion or hero attack another minion or hero
	 *
	 * @param attacker attacker | Amount of damage to deal
	 * @param target The target
	 * @param flags An object with boolean properties to modify the behavior of the attack (e.g., { force: true })
	 *
	 * @returns Success | Errorcode
	 */
	async attack(
		attacker: Target | number,
		target: Target,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		let returnValue: GameAttackReturn;

		// Target is the same as the attacker
		if (!flags.force && attacker === target) {
			return GameAttackReturn.Invalid;
		}

		// Attacker is a number
		if (typeof attacker === "number") {
			return await attack._attackerIsNum(attacker, target, flags);
		}

		// Check if there is a minion with taunt
		const taunts = (
			target instanceof Player ? target : target.owner
		).board.filter((m) => m.hasKeyword(Keyword.Taunt));

		if (taunts.length > 0 && !flags.force) {
			// If the target is a card and has taunt, you are allowed to attack it
			if (target instanceof Card && target.hasKeyword(Keyword.Taunt)) {
				// Allow the attack since the target also has taunt
			} else {
				return GameAttackReturn.Taunt;
			}
		}

		if (attacker instanceof Player) {
			// Attacker is a player
			returnValue = await attack._attackerIsPlayer(attacker, target, flags);
		} else if (attacker instanceof Card) {
			// Attacker is a minion
			returnValue = await attack._attackerIsCard(attacker, target, flags);
		} else {
			// Otherwise
			return GameAttackReturn.Invalid;
		}

		return returnValue;
	},

	// Attacker is a number
	async _attackerIsNum(
		attacker: number,
		target: Target,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		if (!flags.force) {
			if (target instanceof Player && target.immune) {
				return GameAttackReturn.Immune;
			}

			if (target instanceof Card) {
				if (target.hasKeyword(Keyword.Stealth)) {
					return GameAttackReturn.Stealth;
				}

				if (target.hasKeyword(Keyword.Immune)) {
					return GameAttackReturn.Immune;
				}

				if (target.hasKeyword(Keyword.Dormant)) {
					return GameAttackReturn.Dormant;
				}
			}

			if (!target.canBeAttacked()) {
				return GameAttackReturn.Invalid;
			}
		}

		/*
		 * Attacker is a number
		 * Spell damage
		 */
		const damage = await attack._spellDamage(attacker, target, flags);

		if (target instanceof Player) {
			await target.damage(damage);
			return GameAttackReturn.Success;
		}

		if (target.hasKeyword(Keyword.DivineShield)) {
			target.removeKeyword(Keyword.DivineShield);
			return GameAttackReturn.DivineShield;
		}

		await target.damage(damage);

		// Remove frenzy
		await attack._doFrenzy(target);

		return GameAttackReturn.Success;
	},

	// Attacker is a player
	async _attackerIsPlayer(
		attacker: Player,
		target: Target,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		if (!flags.force) {
			if (attacker.frozen) {
				return GameAttackReturn.Frozen;
			}

			if (!attacker.canAttack) {
				return GameAttackReturn.PlayerHasAttacked;
			}

			if (attacker.attack <= 0) {
				return GameAttackReturn.PlayerNoAttack;
			}
		}

		// Target is a player
		if (target instanceof Player) {
			return await attack._attackerIsPlayerAndTargetIsPlayer(
				attacker,
				target,
				flags,
			);
		}

		// Target is a card
		if (target instanceof Card) {
			return await attack._attackerIsPlayerAndTargetIsCard(
				attacker,
				target,
				flags,
			);
		}

		// Otherwise
		return GameAttackReturn.Invalid;
	},

	// Attacker is a player and target is a player
	async _attackerIsPlayerAndTargetIsPlayer(
		attacker: Player,
		target: Player,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		if (!flags.force) {
			if (target.immune) {
				return GameAttackReturn.Immune;
			}

			if (!target.canBeAttacked()) {
				return GameAttackReturn.Invalid;
			}
		}

		// Get the attacker's attack damage, and attack the target with it
		await attack.attack(attacker.attack, target);

		// The attacker can't attack anymore this turn.
		await attack._removeDurabilityFromWeapon(attacker, target);

		await game.event.broadcast(
			Event.Attack,
			[attacker, target, flags],
			attacker,
		);
		return GameAttackReturn.Success;
	},

	// Attacker is a player and target is a card
	async _attackerIsPlayerAndTargetIsCard(
		attacker: Player,
		target: Card,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		// If the target has stealth, the attacker can't attack it
		if (!flags.force) {
			if (target.hasKeyword(Keyword.Stealth)) {
				return GameAttackReturn.Stealth;
			}

			if (target.hasKeyword(Keyword.Immune)) {
				return GameAttackReturn.Immune;
			}

			if (target.hasKeyword(Keyword.Dormant)) {
				return GameAttackReturn.Dormant;
			}

			if (!target.canBeAttacked()) {
				return GameAttackReturn.Invalid;
			}
		}

		// The attacker should damage the target
		await game.attack(attacker.attack, target);
		await game.attack(target.attack ?? 0, attacker);

		// Remove frenzy
		await attack._doFrenzy(target);
		await attack._removeDurabilityFromWeapon(attacker, target);

		await game.event.broadcast(
			Event.Attack,
			[attacker, target, flags],
			attacker,
		);
		return GameAttackReturn.Success;
	},

	// Attacker is a card
	async _attackerIsCard(
		attacker: Card,
		target: Target,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		if (!flags.force) {
			if (attacker.hasKeyword(Keyword.Dormant)) {
				return GameAttackReturn.Dormant;
			}

			if (attacker.hasKeyword(Keyword.Titan)) {
				return GameAttackReturn.Titan;
			}

			if (attacker.hasKeyword(Keyword.Frozen)) {
				return GameAttackReturn.Frozen;
			}

			if (attacker.attackTimes && attacker.attackTimes <= 0) {
				return GameAttackReturn.CardHasAttacked;
			}

			if ((attacker.attack ?? 0) <= 0) {
				return GameAttackReturn.CardNoAttack;
			}

			if (attacker.attackTimes <= 0) {
				return GameAttackReturn.Exhausted;
			}

			if (await this._forgetful(attacker, flags)) {
				return GameAttackReturn.Success;
			}
		}

		// Target is a player
		if (target instanceof Player) {
			return await attack._attackerIsCardAndTargetIsPlayer(
				attacker,
				target,
				flags,
			);
		}

		// Target is a minion
		if (target instanceof Card) {
			return await attack._attackerIsCardAndTargetIsCard(
				attacker,
				target,
				flags,
			);
		}

		// Otherwise
		return GameAttackReturn.Invalid;
	},

	// Attacker is a card and target is a player
	async _attackerIsCardAndTargetIsPlayer(
		attacker: Card,
		target: Player,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		if (!flags.force) {
			if (target.immune) {
				return GameAttackReturn.Immune;
			}

			if (!attacker.canAttackHero) {
				return GameAttackReturn.CantAttackHero;
			}

			if (!target.canBeAttacked()) {
				return GameAttackReturn.Invalid;
			}
		}

		// If attacker has stealth, remove it
		attacker.removeKeyword(Keyword.Stealth);

		// If attacker has lifesteal, heal it's owner
		attack._doLifesteal(attacker);

		// Deal damage
		await attack.attack(attacker.attack ?? 0, target);

		// Remember this attack
		attacker.decrementAttackTimes();

		await game.event.broadcast(
			Event.Attack,
			[attacker, target, flags],
			attacker.owner,
		);
		return GameAttackReturn.Success;
	},

	// Attacker is a card and target is a card
	async _attackerIsCardAndTargetIsCard(
		attacker: Card,
		target: Card,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		if (!flags.force) {
			if (target.hasKeyword(Keyword.Stealth)) {
				return GameAttackReturn.Stealth;
			}

			if (target.hasKeyword(Keyword.Immune)) {
				return GameAttackReturn.Immune;
			}

			if (target.hasKeyword(Keyword.Dormant)) {
				return GameAttackReturn.Dormant;
			}

			if (!target.canBeAttacked()) {
				return GameAttackReturn.Invalid;
			}
		}

		await attack._attackerIsCardAndTargetIsCardDoAttacker(
			attacker,
			target,
			flags,
		);
		await attack._attackerIsCardAndTargetIsCardDoTarget(
			attacker,
			target,
			flags,
		);

		await game.event.broadcast(
			Event.Attack,
			[attacker, target, flags],
			attacker.owner,
		);
		return GameAttackReturn.Success;
	},
	async _attackerIsCardAndTargetIsCardDoAttacker(
		attacker: Card,
		target: Card,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		// Cleave
		await attack._cleave(attacker, target);

		attacker.decrementAttackTimes();
		attacker.removeKeyword(Keyword.Stealth);

		const shouldDamage = attack._cardAttackHelper(attacker);
		if (!shouldDamage) {
			return GameAttackReturn.Success;
		}

		await attack.attack(target.attack ?? 0, attacker);

		// Remove frenzy
		await attack._doFrenzy(attacker);

		// If the target has poison, kill the attacker
		await attack._doPoison(target, attacker);

		return GameAttackReturn.Success;
	},
	async _attackerIsCardAndTargetIsCardDoTarget(
		attacker: Card,
		target: Card,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		const shouldDamage = attack._cardAttackHelper(target);
		if (!shouldDamage) {
			return GameAttackReturn.Success;
		}

		await attack.attack(attacker.attack ?? 0, target);

		attack._doLifesteal(attacker);
		await attack._doPoison(attacker, target);

		// Remove frenzy
		await attack._doFrenzy(target);
		if (target.health && target.health < 0) {
			await attacker.trigger(Ability.Overkill);
		}

		if (target.health && target.health === 0) {
			await attacker.trigger(Ability.HonorableKill);
		}

		return GameAttackReturn.Success;
	},

	// Helper functions
	_cardAttackHelper(card: Card): boolean {
		if (card.hasKeyword(Keyword.Immune)) {
			return false;
		}

		if (card.hasKeyword(Keyword.DivineShield)) {
			card.removeKeyword(Keyword.DivineShield);
			return false;
		}

		return true;
	},

	async _cleave(attacker: Card, target: Card): Promise<void> {
		if (!attacker.hasKeyword(Keyword.Cleave)) {
			return;
		}

		const board = target.owner.board;
		const index = board.indexOf(target);

		const below = board[index - 1];
		const above = board[index + 1];

		// If there is a card below the target, also deal damage to it.
		if (below) {
			await game.attack(attacker.attack ?? 0, below);
		}

		// If there is a card above the target, also deal damage to it.
		if (above) {
			await game.attack(attacker.attack ?? 0, above);
		}
	},

	async _doFrenzy(card: Card): Promise<void> {
		if (!card.isAlive()) {
			return;
		}

		// The card has more than 0 health
		if ((await card.trigger(Ability.Frenzy)) !== Card.REFUND) {
			card.abilities.frenzy = undefined;
		}
	},

	async _doPoison(poisonCard: Card, other: Card): Promise<void> {
		if (!poisonCard.hasKeyword(Keyword.Poisonous)) {
			return;
		}

		// The attacker has poison
		await other.destroy();
	},

	_doLifesteal(attacker: Card): void {
		if (!attacker.hasKeyword(Keyword.Lifesteal)) {
			return;
		}

		// The attacker has lifesteal
		attacker.owner.addHealth(attacker.attack ?? 0);
	},

	async _spellDamage(
		attacker: number,
		target: Target,
		flags: GameAttackFlags = {},
	): Promise<number> {
		if (!flags.spellDamage) {
			return attacker;
		}

		const dmg = attacker + game.player.spellDamage;

		await game.event.broadcast(
			Event.SpellDealsDamage,
			[target, dmg],
			game.player,
		);

		return dmg;
	},

	async _removeDurabilityFromWeapon(
		attacker: Player,
		target: Target,
	): Promise<void> {
		const weapon = attacker.weapon;
		if (!weapon) {
			attacker.canAttack = false;
			return;
		}

		// If the weapon would be part of the attack, remove 1 durability
		if (weapon.attackTimes && weapon.attackTimes > 0 && weapon.attack) {
			weapon.decrementAttackTimes();

			// Only remove 1 durability if the weapon is not unbreakable
			if (!weapon.hasKeyword(Keyword.Unbreakable)) {
				await weapon.damage(1);
			}

			// If the weapon is alive and it has unlimited attacks, the player can attack again this turn
			if (!weapon.isAlive() || !weapon.hasKeyword(Keyword.UnlimitedAttacks)) {
				attacker.canAttack = false;
			}

			if (target instanceof Card) {
				await attack._doPoison(weapon, target);
			}
		}
	},

	async _forgetful(
		attacker: Card,
		flags: GameAttackFlags = {},
	): Promise<boolean> {
		if (!attacker.hasKeyword(Keyword.Forgetful)) {
			return false;
		}

		// Get the forgetful state
		let forgetfulState = attacker.getKeyword(Keyword.Forgetful) as
			| undefined
			| number;

		// If the forgetful state is undefined, set it to 1
		if (forgetfulState === undefined) {
			attacker.setKeyword(Keyword.Forgetful, 1);
			forgetfulState = 1;
		}

		/*
		 * We only do the coin flip if the forgetful state is 1
		 * This is so we can disable forgetful when attacking the random target
		 */
		if (forgetfulState !== 1 || game.lodash.random(0, 1) === 0) {
			return false;
		}

		// Attack a random target instead
		let result: GameAttackReturn = GameAttackReturn.Invalid;

		// Get the owner of the attacker, so we can exclude them from the target selection
		const ownerIsPlayer1 = attacker.owner === game.player1;
		const ownerIsPlayer2 = attacker.owner === game.player2;

		// Set the forgetful state to 2, so we don't do the coin flip again when attacking the random target
		attacker.setKeyword(Keyword.Forgetful, 2);

		// Keep on trying to attack random targets until it works, or we've tried the max times
		for (
			let i = 0;
			i < game.config.advanced.forgetfulRandomTargetFailAmount &&
			result !== GameAttackReturn.Success;
			i++
		) {
			/*
			 * Choose a random enemy target
			 * Only include "Player 1" if player 1 isn't the owner of the attacker
			 * Only include "Player 2" if player 2 isn't the owner of the attacker
			 * Only include player 1's side of the board if player 1 isn't the owner of the attacker
			 * Only include player 2's side of the board if player 2 isn't the owner of the attacker
			 */
			const target = game.functions.util.getRandomTarget(
				!ownerIsPlayer1,
				!ownerIsPlayer2,
				!ownerIsPlayer1,
				!ownerIsPlayer2,
			);

			// If a target wasn't found, just continue with the attack
			if (!target) {
				break;
			}

			// If this doesn't work, it tries again do to the loop
			result = await game.attack(attacker, target, flags);
		}

		// After the loop, set the forgetful state back to 1 so we can do the coin flip again next time
		attacker.setKeyword(Keyword.Forgetful, 1);

		// If the attack was successful, return since it already attacked a random target and this attack is useless now.
		if (result === GameAttackReturn.Success) {
			return true;
		}

		return false;
	},
};

const playCard = {
	/**
	 * Play a card
	 *
	 * @param card The card to play
	 * @param player The card's owner
	 */
	async play(card: Card, player: Player): Promise<GamePlayCardReturn> {
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
			q = player.ai.trade(card);
		} else {
			await game.functions.interact.print.gameState(player);
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
			q = player.ai.forge(card);
		} else {
			await game.functions.interact.print.gameState(player);
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

		await game.functions.interact.print.gameState(player);
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
			game.functions.util.remove(opponent.counter, card.type);
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

		// I'm using while loops to prevent a million indents
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

export class Game {
	/**
	 * Some general functions that can be used.
	 *
	 * This has a lot of abstraction, so don't be afraid to use them.
	 * Look in here for more.
	 */
	functions = functions;

	/**
	 * Shortcut for `game.functions.interact.prompt`.
	 */
	prompt = functions.interact.prompt;

	/**
	 * The player that starts first.
	 */
	player1: Player;

	/**
	 * The player that starts with `The Coin`.
	 */
	player2: Player;

	/**
	 * The player whose turn it is.
	 */
	player: Player;

	/**
	 * The opponent of the player whose turn it is.
	 *
	 * Same as `game.player.getOpponent()`.
	 */
	opponent: Player;

	/**
	 * Event & History managment and tracker.
	 */
	event = eventManager;

	/**
	 * Debug information saved to the log files.
	 */
	debugLog: string[] = [];

	/**
	 * Some configuration for the game.
	 *
	 * Look in the `config` folder.
	 */
	config: GameConfig;

	/**
	 * All of the blueprints cards that have been implemented so far.
	 * Don't use this if you don't know what you're doing.
	 *
	 * Use `Card.all()` instead.
	 */
	blueprints: Blueprint[] = [];

	/**
	 * All of the cards that have been implemented so far.
	 *
	 * Use `Card.all()` instead.
	 */
	cards: Card[] = [];

	/**
	 * All of the cards that are currently active.
	 * This means that they are being referenced somewhere.
	 */
	activeCards: Card[] = [];

	play = playCard.play;

	/**
	 * Makes a minion or hero attack another minion or hero
	 *
	 * @param attacker attacker | Amount of damage to deal
	 * @param target The target
	 * @param force Whether to force the attack. This will bypass any attack restrictions. By default, this is false.
	 *
	 * @returns Success | Errorcode
	 */
	attack = attack.attack;

	/**
	 * The turn counter.
	 *
	 * This goes up at the beginning of each player's turn.
	 *
	 * This means that, for example, if `Player 1`'s turn is on turn 0, then when it's `Player 1`'s turn again, the turn counter is 2.
	 *
	 * Do
	 * ```
	 * game.functions.util.getTraditionalTurnCounter();
	 * ```
	 * for a more conventional turn counter.
	 */
	turn = 0;

	/**
	 * If this is true, the game will not accept input from the user, and so the user can't interact with the game. This will most likely cause an infinite loop, unless both players are ai's.
	 */
	noInput = false;

	/**
	 * If this is true, the game will not output anything to the console.
	 */
	noOutput = false;

	/**
	 * If the game is currently running.
	 *
	 * If this is false, the game loop will end.
	 */
	running = true;

	/**
	 * Cache for the game.
	 */
	cache: Record<string, any> = {};

	time = {
		year: 0,

		events: {
			anniversary: false,

			pride: {
				month: false,
				agender: false,
				aro: false,
				ace: false,
				bi: false,
				genderfluid: false,
				intersex: false,
				lesbian: false,
				enby: false,
				pan: false,
				trans: false,
			},
		},
	};

	lodash = _;
	ids = cardIds;

	/**
	 * Sets up the game by assigning players and initializing game state.
	 *
	 * @param player1 The first player.
	 * @param player2 The second player.
	 */
	constructor(player1: Player, player2: Player) {
		globalThis.game = this;

		// Choose a random player to be player 1 and player 2
		if (this.lodash.random(0, 1)) {
			this.player1 = player1;
			this.player2 = player2;
		} else {
			this.player1 = player2;
			this.player2 = player1;
		}

		// Set the starting players
		this.player = this.player1;
		this.opponent = this.player2;

		// Set the player's ids
		this.player1.id = 0;
		this.player2.id = 1;

		// Check if the date is the 14th of February
		const currentDate = new Date();
		this.time.year = currentDate.getFullYear();
		this.functions.util.setupTimeEvents(currentDate);

		// this.time.events.anniversary = true;
		// this.time.events.pride.month = true;
	}

	/**
	 * Ask the user a question and returns their answer
	 *
	 * @param prompt The question to ask
	 * @param care If this is false, it overrides `game.noInput`. Only use this when debugging.
	 *
	 * @returns What the user answered
	 */
	async input(
		prompt = "",
		overrideNoInput = false,
		useInputQueue = true,
	): Promise<string> {
		return await this.functions.interact.input(
			prompt,
			overrideNoInput,
			useInputQueue,
		);
	}

	/**
	 * Pause the game until the user presses the enter key.
	 * Use this instead of `input` if you don't care about the return value for clarity.
	 *
	 * @param [prompt="Press enter to continue..."] The prompt to show the user
	 */
	async pause(prompt = "Press enter to continue..."): Promise<void> {
		await this.functions.interact.input(prompt);
	}

	/**
	 * @example
	 * game.interest("Starting...");
	 * assert.equal(game.debugLog[0], "Starting...");
	 * game.interest("Something else");
	 * assert.equal(game.debugLog[1], "Something else");
	 *
	 * game.interest("Starting...OK");
	 * assert.equal(game.debugLog[0], "Starting...OK");
	 * assert.equal(game.debugLog[1], "Something else");
	 */
	interest(...data: string[]): void {
		for (const string of data) {
			if (typeof string !== "string") {
				continue;
			}

			const split = `${string.split("...")[0]}...`;

			if (this.debugLog.includes(split)) {
				this.debugLog.splice(this.debugLog.indexOf(split), 1, string);

				game.functions.util.remove(data, string);
			}
		}

		this.debugLog.push(...data);
	}

	/**
	 * Translates the input text to the current locale using the language map, or returns the input text if no translation is found.
	 *
	 * @param text The text to be translated
	 * @returns The translated text or the original text if no translation is found
	 */
	translate(text: string, ...args: unknown[]): string {
		// Ignore starting and ending newlines.
		let start = "";
		if (text.startsWith("\n")) {
			start += "\n";
			text = text.slice(1);
		}

		let end = "";
		if (text.endsWith("\n")) {
			end += "\n";
			text = text.slice(0, -1);
		}

		const newText =
			start +
			(this.functions.util.getCachedLanguageMap()?.[text] || text) +
			end;

		return format(newText, ...args);
	}

	/**
	 * Assigns an ai to the players if in the config.
	 *
	 * Unassigns the player's ai's if not in the config.
	 *
	 * @returns Success
	 */
	doConfigAi(): boolean {
		let setRandomAI = false;

		for (const player of [this.player1, this.player2]) {
			if (player.ai) {
				continue;
			}

			// HACK: Use of never. Might not update correctly if the config format is changed
			if (this.config.ai[`player${player.id + 1}` as never]) {
				player.ai = new AI(player);
			}

			if (this.config.ai.random && !setRandomAI && this.lodash.random() > 0.5) {
				setRandomAI = true;
				player.ai = new AI(player);
			}
		}

		return true;
	}

	/**
	 * Returns if a time-based event is currently active.
	 *
	 * @param event Pass something in `game.time.events` here.
	 */
	isEventActive(event: boolean): boolean {
		// return true; // CHAOS CHAOS!!!
		return event && !this.config.general.disableEvents;
	}

	isDebugSettingEnabled(setting: boolean): boolean {
		return setting || this.config.debug.all;
	}

	// Start / End

	/**
	 * Starts the game
	 *
	 * @returns Success
	 */
	async startGame(): Promise<boolean> {
		// Make players draw cards
		for (let i = 0; i < 2; i++) {
			const player = Player.fromID(i);

			// Suppress "AddCardToHand" and "DrawCard" events in the loop since the events need to be unsuppressed by the time any `card.activate` is called
			const unsuppressAddCardToHand = this.event.suppress(Event.AddCardToHand);
			const unsuppressDrawCard = this.event.suppress(Event.DrawCard);

			// Set the player's hero to the starting hero for the class
			const success = await player.setToStartingHero();
			if (!success) {
				// The starting hero for that class doesn't exist
				throw new Error(
					`File 'cards/StartingHeroes/${player.heroClass}/?-hero.ts' is either; Missing or Incorrect. Please copy the working 'cards/StartingHeroes/' folder from the github repo to restore a working copy. Error Code: 12`,
				);
			}

			/*
			 * Add quest cards to the player's hand.
			 */
			for (const card of player.deck) {
				if (card.tags.includes(Tag.Quest)) {
					await player.drawSpecific(card);
				}
			}

			// Draw 3-4 cards
			const amountOfCards = player.id === 0 ? 3 : 4;

			// This accounts for the quest cards
			await player.drawCards(amountOfCards - player.hand.length);

			unsuppressAddCardToHand();
			unsuppressDrawCard();

			for (const card of player.deck) {
				await card.trigger(Ability.StartOfGame);
			}

			for (const card of player.hand) {
				await card.trigger(Ability.StartOfGame);
			}
		}

		/*
		 * Set the starting mana for the first player.
		 * The second player will get this when their turn starts
		 */
		this.player1.emptyMana = 1;
		this.player1.mana = 1;

		// Give the coin to the second player
		const coin = await Card.create(
			this.ids.Official.builtin.the_coin[0],
			this.player2,
		);

		await this.event.withSuppressed(Event.AddCardToHand, async () =>
			this.player2.addToHand(coin),
		);

		this.turn += 1;

		return true;
	}

	/**
	 * Ends the game and declares `winner` as the winner
	 *
	 * @param winner The winner
	 *
	 * @returns Success
	 */
	async endGame(winner: Player): Promise<boolean> {
		if (!winner) {
			return false;
		}

		this.functions.interact.print.watermark();
		console.log();

		// Do this to bypass 'Press enter to continue' prompt when showing history
		const history = await this.functions.interact.processCommand("history", {
			echo: false,
		});

		console.log(history);

		await this.pause(`${winner.getName()} wins!\n`);

		this.running = false;

		return true;
	}

	/**
	 * Ends the players turn and starts the opponents turn
	 *
	 * @returns Success
	 */
	async endTurn(): Promise<boolean> {
		// Everything after this comment happens when the player's turn ends
		const player = this.player;
		const opponent = this.opponent;

		// Ready the minions for the next turn.
		for (const card of player.board) {
			card.ready();
		}

		// Remove echo cards
		player.hand = player.hand.filter((c) => !c.hasKeyword(Keyword.Echo));
		player.canAttack = true;

		// Trigger unspent mana
		if (player.mana > 0) {
			await this.event.broadcast(Event.UnspentMana, player.mana, player);
		}

		await this.event.broadcast(Event.EndTurn, this.turn, player);

		// Everything after this comment happens when the opponent's turn starts
		this.turn++;

		// Mana stuff
		opponent.addEmptyMana(1);
		opponent.mana = opponent.emptyMana - opponent.overload;
		opponent.overload = 0;
		opponent.attack = 0;

		// Weapon stuff
		if (opponent.weapon?.attack && opponent.weapon.attack > 0) {
			opponent.attack = opponent.weapon.attack;
			opponent.weapon.ready();
		}

		// Chance to spawn in a diy card
		if (
			this.lodash.random(0, 1, true) <=
				this.config.advanced.diyCardSpawnChance &&
			this.config.advanced.spawnInDiyCards
		) {
			await opponent.spawnInDIYCard();
		}

		// Minion start of turn
		for (const card of opponent.board) {
			// Dormant
			const dormant = card.getKeyword(Keyword.Dormant) as number | undefined;

			if (dormant) {
				// If the current turn is less than the dormant value, do nothing
				if (this.turn <= dormant) {
					continue;
				}

				// Remove dormant
				card.removeKeyword(Keyword.Dormant);
				card.exhaust();

				/*
				 * Set the card's turn to this turn.
				 * TODO: Should this happen? #277
				 */
				// card.turnCreated = this.turn;

				// HACK: If the battlecry use a function that depends on `game.player`
				this.player = opponent;
				await card.trigger(Ability.Battlecry);
				this.player = player;

				continue;
			}

			card.canAttackHero = true;
			card.removeKeyword(Keyword.Frozen);

			card.ready();

			// Stealth duration
			if (
				card.stealthDuration &&
				card.stealthDuration > 0 &&
				this.turn > card.stealthDuration
			) {
				card.stealthDuration = 0;
				card.removeKeyword(Keyword.Stealth);
			}

			// Location cooldown
			if (card.type === Type.Location && card.cooldown && card.cooldown > 0) {
				card.cooldown--;
			}
		}

		// Draw card
		await opponent.drawCards(1);

		opponent.hasUsedHeroPowerThisTurn = false;

		this.player = opponent;
		this.opponent = player;

		await this.event.broadcast(Event.StartTurn, this.turn, opponent);
		return true;
	}

	// Interacting with minions

	/**
	 * Summon a minion.
	 * Broadcasts the `SummonCard` event
	 *
	 * @param card The minion to summon
	 * @param player The player who gets the minion
	 * @param colossal If the minion has colossal, summon the other minions.
	 *
	 * @returns The minion summoned
	 */
	async summon(
		card: Card,
		player: Player,
		colossal = true,
	): Promise<GamePlayCardReturn> {
		if (!card.canBeOnBoard()) {
			return GamePlayCardReturn.Invalid;
		}

		// If the board has max capacity, and the card played is a minion or location card, prevent it.
		if (player.board.length >= game.config.general.maxBoardSpace) {
			return GamePlayCardReturn.Space;
		}

		player.spellDamage = 0;

		if (
			card.hasKeyword(Keyword.Charge) ||
			card.hasKeyword(Keyword.Rush) ||
			card.hasKeyword(Keyword.Titan)
		) {
			card.ready();
		}

		if (card.hasKeyword(Keyword.Rush)) {
			card.canAttackHero = false;
		}

		const dormant = card.getKeyword(Keyword.Dormant) as number | undefined;

		const colossalMinionIds = card.getKeyword(Keyword.Colossal) as
			| string[]
			| undefined;

		if (colossalMinionIds && colossal) {
			/*
			 * Minion.colossal is an id array.
			 * example: [game.ids.Official.examples.left_arm[0], game.ids.null, game.ids.Official.examples.right_arm[0]]
			 * the `null` gets replaced with the main minion
			 */

			const unsuppress = game.event.suppress(Event.SummonCard);

			for (const cardId of colossalMinionIds) {
				if (cardId === this.ids.null) {
					// Summon this minion without triggering colossal again
					await player.summon(card, false);
					continue;
				}

				const cardToSummon = await Card.create(cardId, player);

				// If this card has dormant, add it to the summoned minions as well.
				if (dormant) {
					cardToSummon.addKeyword(Keyword.Dormant, dormant);
				}

				await player.summon(cardToSummon);
			}

			unsuppress();

			/*
			 * Return since we already handled the main minion up in the "cardId <= 0" if statement
			 * You should probably just ignore this error code
			 */
			return GamePlayCardReturn.Colossal;
		}

		if (dormant) {
			/*
			 * Oh no... Why is this not documented?
			 *
			 * If the minion that got summoned has dormant, it sets the dormant value to itself plus the current turn.
			 * This is so that the game can know when to remove the dormant by checking which turn it is.
			 * We should really document this somewhere, since it can easily be overriden by a card after it has been summoned, which would cause unexpected behavior.
			 */
			card.setKeyword(Keyword.Dormant, dormant + game.turn);
			card.addKeyword(Keyword.Immune);

			// TODO: Why are we readying the dormant minion? #277
			card.ready();
		}

		player.board.push(card);
		await card.setLocation(Location.Board);

		// Calculate new spell damage
		for (const card of player.board) {
			if (card.spellDamage) {
				player.spellDamage += card.spellDamage;
			}
		}

		await game.event.broadcast(Event.SummonCard, card, player);
		return GamePlayCardReturn.Success;
	}

	/**
	 * Kill all minions with 0 or less health
	 *
	 * @returns The amount of minions killed
	 */
	async killCardsOnBoard(): Promise<number> {
		let amount = 0;

		for (let p = 0; p < 2; p++) {
			const player = Player.fromID(p);

			/*
			 * The minions with more than 0 health will be added to this list.
			 * The player's side of the board will be set to this list at the end.
			 * This will effectively remove all minions with 0 or less health from the board
			 */
			const spared: Card[] = [];

			// Trigger the deathrattles before doing the actual killing so the deathrattles can save the card by setting it's health to above 0
			for (const card of player.board) {
				if (card.isAlive()) {
					continue;
				}

				await card.trigger(Ability.Deathrattle);
			}

			for (const card of player.board) {
				// Add minions with more than 0 health to `spared`.
				if (card.isAlive()) {
					spared.push(card);
					continue;
				}

				// Calmly tell the minion that it is going to die
				const removeReturn = await card.trigger(
					Ability.Remove,
					RemoveReason.Destroy,
				);

				// If the "remove" ability returns false, the card is not removed from the board
				if (Array.isArray(removeReturn) && removeReturn.includes(false)) {
					spared.push(card);
					continue;
				}

				card.turnKilled = this.turn;
				amount++;

				player.corpses++;
				player.graveyard.push(card);
				await card.setLocation(Location.Graveyard);

				await this.event.broadcast(Event.DestroyCard, card, this.player);

				if (!card.hasKeyword(Keyword.Reborn)) {
					continue;
				}

				// Reborn
				const minion = await card.imperfectCopy();
				minion.removeKeyword(Keyword.Reborn);

				// Reduce the minion's health to 1, keep the minion's attack the same
				await minion.setStats(minion.attack, 1);

				/*
				 * Suppress the event here since we activate some abilities on the minion further up.
				 * This isn't great performance wise, but there's not much we can do about it.
				 * Although the performance hit is only a few milliseconds in total every time (This function does get called often), so there's bigger performance gains to be had elsewhere.
				 */
				await this.event.withSuppressed(Event.SummonCard, async () =>
					this.summon(minion, player),
				);

				/*
				 * Activate the minion's passive
				 * We're doing this because otherwise, the passive won't be activated this turn
				 * Normally when we summon a minion, it will be activated immediately, since the `PlayCard` event gets triggered immediately after playing the card
				 * but this is not the case here, since we are directly summoning the minion, and we told it to not broadcast the event.
				 * The `reborn` string is passed in order for the card to know why the passive was triggered. The card can explicitly look for the `reborn` string
				 * in its passive.
				 * So it looks like this:
				 * minion.activate(key, reason, minion);
				 */
				await minion.trigger(Ability.Passive, "reborn", card, this.player);

				spared.push(minion);
			}

			player.board = spared;
		}

		return amount;
	}
}

/**
 * Creates a new game instance, initializes players, sets up the game, imports all cards, and configures AI.
 *
 * @param [registerCards=true] Whether to register all cards. Disable for optimization purposes.
 *
 * @returns An object containing the game instance, player 1, and player 2.
 */
export async function createGame(registerCards = true) {
	const player1 = new Player();
	const player2 = new Player();
	const game = new Game(player1, player2);
	await game.functions.util.importConfig();
	await game.functions.util.importLanguageMap();
	game.doConfigAi();
	if (registerCards) {
		await Card.registerAll();
	}

	return { game, player1, player2 };
}

declare global {
	/**
	 * The global game
	 */
	var game: Game;
}
