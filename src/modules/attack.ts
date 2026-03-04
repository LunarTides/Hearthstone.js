import { Card } from "@Game/card.ts";
import { Player } from "@Game/player.ts";
import {
	Ability,
	Event,
	type GameAttackFlags,
	GameAttackReturn,
	Keyword,
	type Target,
} from "@Game/types.ts";

export const attack = {
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
			const target = game.randomTarget(
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
