import type { Ai } from "@Game/ai.ts";
import { Card } from "@Game/card.ts";

import {
	Ability,
	CardTag,
	Class,
	Event,
	type GameAttackFlags,
	Keyword,
	Location,
	type QuestCallback,
	type QuestObject,
	QuestType,
	Rune,
	type Target,
	Type,
} from "@Game/types.ts";

export class Player {
	/**
	 * This is:
	 *
	 * 0: if this is the starting player
	 *
	 * 1: if this is the player that starts with the coin
	 */
	id = -1;

	/**
	 * The player's AI.
	 *
	 * # Examples
	 * @example
	 * const discover = player.ai.discover();
	 *
	 * console.log(discover);
	 */
	ai?: Ai;

	/**
	 * How much damage the player gets damaged the next time they draw a card from an empty deck.
	 *
	 * This increments every time a player draws from an empty deck.
	 */
	fatigue = 0;

	/**
	 * The player's deck.
	 *
	 * This can be shuffled at any time so don't rely on the order of the cards.
	 *
	 * # Examples
	 * @example
	 * for (const card of player.deck) {
	 *     console.log(card.name);
	 * }
	 */
	deck: Card[] = [];

	/**
	 * The player's hand.
	 *
	 * # Examples
	 * @example
	 * for (const card of player.hand)
	 *     console.log(card.name);
	 * }
	 */
	hand: Card[] = [];

	/**
	 * The player's side of the board.
	 *
	 * # Examples
	 * @example
	 * for (const card of player.board)
	 *     console.log(card.name);
	 * }
	 */
	board: Card[] = [];

	/**
	 * The player's side of the graveyard, a list of cards that have been killed.
	 *
	 * # Examples
	 * @example
	 * for (const card of player.graveyard)
	 *     console.log(card.name);
	 * }
	 */
	graveyard: Card[] = [];

	/**
	 * The amount of mana that the player CURRENTLY has.
	 *
	 * # Examples
	 * @example
	 * // Use `player.refreshMana(2, player.maxMana)` instead in a real situation.
	 * player.mana += 2;
	 */
	mana = 0;

	/**
	 * The amount of empty mana crystals the player has. This increments every turn until it reaches `player.maxMana`.
	 *
	 * # Examples
	 * @example
	 * // Use `player.addEmptyMana(2)` instead in a real situation.
	 * player.emptyMana += 2;
	 */
	emptyMana = 0;

	/**
	 * The max amount of mana the player can have. This is normally fixed at `10` but can be changed.
	 *
	 * # Examples
	 * ```
	 * player.maxMana = 20;
	 * // Now `player.emptyMana` will increment every turn until it reaches 20.
	 * ```
	 */
	maxMana = 10;

	/**
	 * The amount of overload the player has. See the overload mechanic on the Hearthstone Wiki.
	 *
	 * # Examples
	 * ```
	 * // Use `player.addOverload(2)` instead in a real situation.
	 * player.overload += 2;
	 * // Now the player will have 2 less mana next turn.
	 * ```
	 */
	overload = 0;

	/**
	 * The amount of health the player has.
	 *
	 * # Examples
	 * ```
	 * // Use `player.damage(3)` instead in a real situation.
	 * player.health -= 3;
	 * ```
	 */
	health = 30;

	/**
	 * The maximum health the player can have. This is normally fixed to the amount of health the player starts with (`30`).
	 *
	 * # Examples
	 * ```
	 * player.maxHealth = 40;
	 * ```
	 */
	maxHealth = 30;

	/**
	 * The amount of armor the player has.
	 *
	 * # Examples
	 * ```
	 * // Use `player.addArmor(3)` instead in a real situation.
	 * player.armor += 3;
	 * ```
	 */
	armor = 0;

	/**
	 * The hero card that the player has. This is normally set to one of the starting heroes.
	 *
	 * # Examples
	 * ```
	 * // We're assuming that the player is a Priest, and hasn't played a hero card.
	 * assert.equal(typeof player.hero.heropower, 'function');
	 * assert.equal(player.hero.name, "Priest Starting Hero");
	 *
	 * // Activate the hero's hero power. (`Restore 2 Health.`)
	 * await player.hero.activate(Ability.Heropower);
	 * ```
	 */
	hero: Card;

	/**
	 * The class the player is. This is set to either: Mage, Priest, Warlock, Warrior, ...
	 */
	heroClass = Class.Mage;

	/**
	 * If the player can use their hero power.
	 *
	 * This resets to true every turn.
	 */
	hasUsedHeroPowerThisTurn = false;

	/**
	 * The playerId / card uuids of the entities blocking this players hero power. Use the {@link disableHeroPower} and {@link enableHeroPower} functions.
	 */
	heroPowerBlockers: (string | number)[] = [];

	/**
	 * The player's weapon. Functions like any other card.
	 *
	 * # Examples
	 * ```
	 * // Use `player.destroyWeapon()` instead in a real situation.
	 * player.weapon.destroy();
	 * ```
	 */
	weapon?: Card;

	/**
	 * If the player can attack.
	 * This is set to `true` by default, and only gets set to `false` once the player attacks, and is reset to `true` at the end of the turn.
	 */
	canAttack = true;

	/**
	 * If the player is frozen.
	 *
	 * If a player is frozen, they can't attack.
	 */
	frozen = false;

	/**
	 * If the player is immune to damage.
	 */
	immune = false;

	/**
	 * How much attack the player has.
	 */
	attack = 0;

	/**
	 * How much spell damage the player has.
	 */
	spellDamage = 0;

	/**
	 * The card types to counter.
	 *
	 * If this player's counter includes "Minion", and this player plays a Minion, it gets countered.
	 */
	counter: Type[] = [];

	/**
	 * The secrets that the player has.
	 */
	secrets: QuestObject<Event>[] = [];

	/**
	 * The sidequests that the player has.
	 */
	sidequests: QuestObject<Event>[] = [];

	/**
	 * The quest that the player has.
	 */
	quests: QuestObject<Event>[] = [];

	/**
	 * How much attack/health (+1) the player's next jade golem will have.
	 */
	jadeCounter = 0;

	/**
	 * How many corpses the player has.
	 *
	 * This increases even if the player is not a Death Knight, so don't count on this number telling you if the player is a Death Knight or not.
	 */
	corpses = 0;

	/**
	 * The runes that the player has.
	 */
	runes: Rune[] = [];

	/**
	 * If this is not null, it will automatically choose this target when asked instead of asking the player.
	 *
	 * # Example
	 * ```
	 * player.forceTarget = target;
	 * const chosen = await game.prompt.target("Example", null);
	 * player.forceTarget = undefined;
	 *
	 * assert.equal(chosen, target);
	 * ```
	 */
	forceTarget?: Target;

	/**
	 * Answers for the player.
	 *
	 * If this is a list, whenever the game asks for input from the user, instead it answers with the first element from the list, then it removes that element from the list.
	 *
	 * If this is a string, whenever the game asks for input from the user, instead it just answers with that string, and doesn't remove it.
	 *
	 * # Example
	 * ```
	 * // Only run this code when the player's turn starts
	 * player.inputQueue = ["attack", "1", "1", "end"]; // Does these commands in order
	 *
	 * // Once it has done all these commands, `player.inputQueue` = null
	 * ```
	 *
	 * #### Or with just a string
	 *
	 * ```
	 * // Whenever the game asks the player a question, just answer with `e` every time. This will most likely make the game unplayable, however in certain contexts this can be useful.
	 * player.inputQueue = "e";
	 * ```
	 */
	inputQueue?: string | string[];

	/**
	 * If the player has `detail mode` enabled.
	 *
	 * This gets enabled when the player enters the `detail` command.
	 */
	detailedView = false;

	/**
	 * Retrieves the player corresponding to the given id.
	 * 0 is Player 1.
	 * 1 is Player 2.
	 *
	 * @param id The id of the player - 1.
	 *
	 * @returns The player
	 */
	static fromID(id: number) {
		if (id === 0) {
			return game.player1;
		}

		return game.player2;
	}

	/**
	 * Returns the name of the player.
	 *
	 * This is the name of the player in the format "Player X" where X is the id of the player plus 1.
	 *
	 * @returns The name of the player.
	 */
	getName() {
		return `Player ${this.id + 1}`;
	}

	/**
	 * Get this player's opponent
	 *
	 * # Examples
	 * ```
	 * const opponent = player.getOpponent();
	 *
	 * assert.notEqual(player.id, opponent.id);
	 * ```
	 */
	getOpponent(): Player {
		if (this.id === 0) {
			return game.player2;
		}

		return game.player1; // We always need to return a player.
	}

	// Mana

	/**
	 * Adds `mana` to this player, without going over `comp` mana.
	 *
	 * # Examples
	 * ```
	 * assert.equal(player.emptyMana, 7);
	 * assert.equal(player.mana, 5);
	 *
	 * player.refreshMana(10);
	 *
	 * assert.equal(player.mana, 7);
	 * ```
	 * If comp is `player.maxMana`
	 * ```
	 * assert.equal(player.emptyMana, 7);
	 * assert.equal(player.mana, 5);
	 *
	 * player.refreshMana(10, player.maxMana);
	 *
	 * assert.equal(player.mana, 10);
	 * ```
	 * You can set comp to any value
	 * ```
	 * assert.equal(player.mana, 5);
	 *
	 * player.refreshMana(10, 200);
	 *
	 * assert.equal(player.mana, 15);
	 * ```
	 *
	 * @param mana The mana to add
	 * @param comp The comperison. This defaults to `player.emptyMana`.
	 *
	 * @returns Whether or not the mana was capped
	 */
	refreshMana(mana: number, comp?: number): boolean {
		const comperison = comp ?? this.emptyMana;

		this.mana += mana;

		if (this.mana > comperison) {
			this.mana = comperison;
			return true;
		}

		return false;
	}

	/**
	 * Increases empty mana by `mana`, avoids going over `player.maxMana` (10 by default) mana.
	 *
	 * # Examples
	 * If you set `cap` to true
	 * ```
	 * assert.equal(player.emptyMana, 5);
	 *
	 * player.addEmptyMana(10);
	 *
	 * assert.equal(player.emptyMana, 10);
	 * ```
	 *
	 * @param mana The empty mana to add.
	 *
	 * @returns Whether or not the empty mana was capped to the max mana
	 */
	addEmptyMana(mana: number): boolean {
		this.emptyMana += mana;

		if (this.emptyMana > this.maxMana) {
			this.emptyMana = this.maxMana;
			return true;
		}

		return false;
	}

	/**
	 * Increases both mana and empty mana by `mana`.
	 *
	 * This function runs
	 * ```
	 * player.addEmptyMana(mana);
	 * player.refreshMana(mana);
	 * ```
	 * so look at these functions for more info.
	 *
	 * @param mana The number to increase mana and empty mana by
	 *
	 * @returns Whether or not the mana or empty mana was capped
	 */
	addMana(mana: number): boolean {
		const emptyCapped = this.addEmptyMana(mana);
		const fullCapped = this.refreshMana(mana, this.maxMana);

		return emptyCapped || fullCapped;
	}

	/**
	 * Increases the players overload by `overload`. Overload will not take into affect until the player's next turn.
	 *
	 * ```
	 * assert.equal(player.overload, 0);
	 *
	 * await player.addOverload(2);
	 *
	 * assert.equal(player.overload, 2);
	 * ```
	 *
	 * @param overload The amount of overload to add
	 *
	 * @returns Success
	 */
	async addOverload(overload: number): Promise<boolean> {
		this.overload += overload;

		await game.event.broadcast(Event.GainOverload, overload, this);
		return true;
	}

	// Weapons

	/**
	 * Sets this player's weapon to `weapon`
	 *
	 * # Examples
	 * ```
	 * const weapon = game.createCard(game.cardIds.notRealExampleWeapon_0, player);
	 * await player.setWeapon(weapon);
	 * ```
	 *
	 * @param weapon The weapon to set
	 *
	 * @returns Success
	 */
	async setWeapon(weapon: Card): Promise<boolean> {
		await this.destroyWeapon();
		this.weapon = weapon;
		this.attack += weapon.attack!;

		return true;
	}

	/**
	 * Destroys this player's weapon
	 *
	 * # Examples
	 * ```
	 * // Assume the player has a weapon with 5 attack and the player hasn't attacked this turn.
	 * assert.equal(player.weapon.attack, 5);
	 * assert.equal(player.attack, 5);
	 *
	 * await player.destroyWeapon();
	 *
	 * assert.equal(player.weapon, null);
	 * assert.equal(player.attack, 0);
	 * ```
	 *
	 * @returns Success
	 */
	async destroyWeapon(): Promise<boolean> {
		if (!this.weapon) {
			return false;
		}

		await this.weapon.trigger(Ability.Deathrattle);
		this.attack -= this.weapon.attack!;

		await this.weapon.destroy();
		this.weapon = undefined;

		return true;
	}

	// Stats

	/**
	 * Increases the player's armor by `amount`.
	 *
	 * @param amount The amount the player's armor should increase by
	 *
	 * @returns Success
	 */
	addArmor(amount: number): boolean {
		this.armor += amount;
		return true;
	}

	/**
	 * Increases the player's attack by `amount`.
	 *
	 * @param amount The amount the player's attack should increase by
	 *
	 * @returns Success
	 */
	async addAttack(amount: number): Promise<boolean> {
		this.attack += amount;

		await game.event.broadcast(Event.GainHeroAttack, amount, this);
		return true;
	}

	/**
	 * Increases the player's health by `amount`
	 *
	 * @param amount The amount the player's health should increase by
	 *
	 * @returns Whether or not the health was capped to the max health.
	 */
	addHealth(amount: number): boolean {
		this.health += amount;

		if (this.health > this.maxHealth) {
			this.health = this.maxHealth;
			return true;
		}

		return false;
	}

	/**
	 * Decreases the player's health by `amount`. If the player has armor, the armor gets decreased instead.
	 *
	 * This also handles the player being dealt a fatal attack. In other words, if this function causes the player to die, it will immediately end the game.
	 * Broadcasts the `TakeDamage` event and the `FatalDamage`? event
	 *
	 * @param amount The amount the player's health should decrease by
	 *
	 * @returns Success
	 */
	async damage(amount: number): Promise<boolean> {
		if (this.immune) {
			return true;
		}

		// Armor logic
		const remainingArmor = this.armor - amount;
		this.armor = Math.max(remainingArmor, 0);

		// Armor blocks all damage, return true since there were no errors.
		if (remainingArmor >= 0) {
			return true;
		}

		/*
		 * The amount of damage to take is however much damage penetrated the armor.
		 * The remaining armor is negative, so turn it into a positive number so it's easier to work with
		 */
		const actualAmount = Math.abs(remainingArmor);

		this.health -= actualAmount;

		await game.event.broadcast(Event.TakeDamage, actualAmount, this);

		if (!this.isAlive()) {
			await game.event.broadcast(Event.FatalDamage, undefined, this);

			// This is done to allow secrets to prevent death
			if (!this.isAlive()) {
				await game.endGame(this.getOpponent());
			}
		}

		return true;
	}

	// Hand / Deck

	/**
	 * Adds a card to this player's deck at a specific index.
	 * Broadcasts the `AddCardToDeck` event.
	 *
	 * @param card The card to add to the deck
	 * @param index The index to add the card to
	 */
	async addToDeck(card: Card, index: number = this.deck.length): Promise<void> {
		this.deck.splice(index, 0, card);
		await card.setLocation(Location.Deck);

		await game.event.broadcast(Event.AddCardToDeck, card, this);
	}

	/**
	 * Shuffles this player's deck
	 */
	shuffleDeck(): void {
		this.deck = game.lodash.shuffle(this.deck);
	}

	/**
	 * Shuffle a card into this player's deck. This will shuffle the deck.
	 * Broadcasts the `AddCardToDeck` event.
	 *
	 * This gets acheived by adding the card to the top of the deck, then shuffling the entire deck.
	 *
	 * ```
	 * assert.equal(player.deck.length, 30);
	 *
	 * const card = game.createCard(game.cardIds.sheep_1, player);
	 * await player.shuffleIntoDeck(card);
	 *
	 * assert.equal(player.deck.length, 31);
	 * ```
	 *
	 * @param card The card to shuffle
	 *
	 * @returns Success
	 */
	async shuffleIntoDeck(card: Card): Promise<boolean> {
		// Push the card to the top of the deck, then shuffle it
		this.addToDeck(card);
		this.shuffleDeck();
		return true;
	}

	/**
	 * Adds a card to the bottom of this player's deck. This keeps the order of the deck..
	 * Broadcasts the `AddCardToDeck` event
	 *
	 * @param card The card to add to the bottom of the deck
	 *
	 * @returns Success
	 */
	async addToBottomOfDeck(card: Card): Promise<boolean> {
		this.addToDeck(card, 0);
		return true;
	}

	/**
	 * Removes and returns the last `amount` cards from the deck.
	 * Broadcasts the `DrawCard` event for each card drawn
	 *
	 * @param amount The amount of cards to draw
	 * @returns The cards drawn
	 */
	async drawCards(amount: number): Promise<Card[]> {
		const cards: Card[] = [];

		const unsuppress = game.event.suppress(Event.AddCardToHand);

		let drawAmount = amount;
		for (let i = 0; i < drawAmount; i++) {
			// We need the `deckLength` variable since pop may change the length of the deck
			const deckLength = this.deck.length;
			const card = this.deck.pop();

			// Fatigue
			if (deckLength <= 0 || !card) {
				this.fatigue++;

				await this.damage(this.fatigue);
				continue;
			}

			// Cast on draw
			if (
				card.type === Type.Spell &&
				card.hasKeyword(Keyword.CastOnDraw) &&
				(await card.trigger(Ability.Cast))
			) {
				drawAmount += 1;
				continue;
			}

			// Summon on draw
			if (card.hasKeyword(Keyword.SummonOnDraw) && card.canBeOnBoard()) {
				await this.summon(card);

				drawAmount += 1;
				continue;
			}

			await this.addToHand(card);
			await game.event.broadcast(Event.DrawCard, card, this);
			cards.push(card);
		}

		unsuppress();

		return cards;
	}

	/**
	 * Draws a specific card from this player's deck.
	 * Broadcasts the `DrawCard` event
	 *
	 * # Examples
	 * This works
	 * ```
	 * // Get a random card from the player's deck
	 * const card = game.functions.randList(player.deck);
	 *
	 * await player.drawSpecific(card);
	 * ```
	 *
	 * This doesn't work
	 * ```
	 * const card = game.functions.randList(player.deck).perfectCopy();
	 *
	 * await player.drawSpecific(card);
	 * ```
	 *
	 * @param card The card to draw
	 *
	 * @returns The card drawn
	 */
	async drawSpecific(card: Card): Promise<Card | undefined> {
		if (this.deck.length <= 0 || !this.deck.includes(card)) {
			return undefined;
		}

		game.functions.util.remove(this.deck, card);

		if (
			card.type === Type.Spell &&
			card.hasKeyword(Keyword.CastOnDraw) &&
			(await card.trigger(Ability.Cast))
		) {
			return undefined;
		}

		await game.event.withSuppressed(Event.AddCardToHand, async () =>
			this.addToHand(card),
		);

		await game.event.broadcast(Event.DrawCard, card, this);
		return card;
	}

	/**
	 * Adds a card to the player's hand.
	 * Broadcasts the `AddCardToHand` event
	 *
	 * @param card The card to add
	 *
	 * @returns Success
	 */
	async addToHand(card: Card): Promise<boolean> {
		if (this.hand.length >= game.config.general.maxHandLength) {
			return false;
		}

		this.hand.push(card);
		await card.setLocation(Location.Hand);

		await game.event.broadcast(Event.AddCardToHand, card, this);
		return true;
	}

	/**
	 * Removes a card from the player's hand and returns it.
	 * Broadcasts no events.
	 *
	 * @param index The index of the card to remove
	 *
	 * @returns The removed card, or undefined if no card was found at the index
	 */
	async popFromHand(
		index: number = this.hand.length - 1,
	): Promise<Card | undefined> {
		const card = this.hand.splice(index, 1)[0];
		if (!card) {
			return undefined;
		}

		await card.setLocation(Location.None);
		return card;
	}

	// Hero power / Class

	/**
	 * Sets the player's hero to `hero`
	 *
	 * @param hero The hero that the player should be set to
	 * @param setHeroClass Set the players hero class.
	 *
	 * @returns Success
	 */
	async setHero(hero: Card, setHeroClass = true): Promise<boolean> {
		if (setHeroClass && hero.classes.includes(Class.Neutral)) {
			game.interest(
				"Setting player's class to Neutral. This may cause issues.",
			);
		}

		if (this.hero) {
			// Ask the hero if its okay with dying.
			const removeReturn = await this.hero.trigger(Ability.Remove, "destroy");

			// If the "remove" ability returns false, the hero is NOT replaced.
			if (Array.isArray(removeReturn) && removeReturn[0] === false) {
				return false;
			}

			// Set the previous hero's location to None.
			this.hero.setLocation(Location.None);
		}

		const previousHero = this.hero;
		this.hero = hero;
		this.hero.setLocation(Location.Hero);

		if (setHeroClass) {
			this.heroClass = hero.classes[0];
		}

		this.armor += hero.armor!;

		await game.event.broadcast(Event.ChangeHero, [previousHero, hero], this);
		return true;
	}

	/**
	 * Sets the player's hero to the default hero of `heroClass`
	 *
	 * @param heroClass The class of the hero. This defaults to the player's class.
	 *
	 * @returns Success
	 */
	async setToStartingHero(heroClass = this.heroClass): Promise<boolean> {
		const hero = (await Card.allWithTags(CardTag.StartingHero)).find((card) =>
			card.classes.includes(heroClass),
		);

		if (!hero) {
			return false;
		}

		hero.owner = this;
		this.setHero(await hero.imperfectCopy(), false);
		return true;
	}

	/**
	 * Activate the player's hero power.
	 *
	 * @returns Success | Cancelled
	 */
	async heroPower(): Promise<boolean | typeof Card.REFUND> {
		if (!this.canUseHeroPower()) {
			return false;
		}

		if (!this.hero || !this.hero.heropower) {
			return false;
		}

		if (
			(await this.hero.heropower?.trigger(Ability.HeroPower)) === Card.REFUND
		) {
			return Card.REFUND;
		}

		for (const card of this.board) {
			await card.trigger(Ability.Inspire);
		}

		this.mana -= this.hero.heropower!.cost;
		this.hasUsedHeroPowerThisTurn = true;

		await game.event.broadcast(Event.HeroPower, this.hero.heropower, this);
		return true;
	}

	/**
	 * Disable this player's hero power.
	 *
	 * @param blockerId Pass the card's uuid or the player's id, depending who's calling this function.
	 * @returns Returns false if the hero power has already been blocked by this source.
	 */
	disableHeroPower(blockerId: string | number): boolean {
		if (this.heroPowerBlockers.includes(blockerId)) {
			return false;
		}

		this.heroPowerBlockers.push(blockerId);
		return true;
	}

	/**
	 * Enables this player's hero power.
	 *
	 * If the hero power is being blocked by something else, it will remain blocked.
	 *
	 * @param blockerId Pass the card's uuid or the player's id, depending who's calling this function.
	 * @returns Returns false if this card wasn't blocked by that source.
	 */
	enableHeroPower(blockerId: string | number): boolean {
		return game.functions.util.remove(this.heroPowerBlockers, blockerId);
	}

	// Other

	/**
	 * Calls `callback` if the player has `amount` corpses. Doesn't work if the player isn't a Death Knight, or if the player doesn't have enough corpses.
	 *
	 * @param amount The amount of corpses to trade
	 * @param callback The function to call when the trade is successful.
	 *
	 * @returns Success
	 */
	tradeCorpses(amount: number, callback: () => void): boolean {
		if (!this.canUseCorpses()) {
			return false;
		}

		if (this.corpses < amount) {
			return false;
		}

		this.corpses -= amount;
		callback();

		return true;
	}

	/**
	 * @returns Whether or not the player can use corpses
	 */
	canUseCorpses(): boolean {
		return [Class.DeathKnight].includes(this.heroClass);
	}

	/**
	 * @returns Whether or not the player can use runes
	 */
	canUseRunes(): boolean {
		return [Class.DeathKnight].includes(this.heroClass);
	}

	/**
	 * @returns If the player can attack
	 */
	canBeAttacked(): boolean {
		return !this.immune;
	}

	/**
	 * @returns If the player can use their heropower
	 */
	canUseHeroPower(): boolean {
		return (
			this.mana >= this.hero.heropower!.cost &&
			!this.hasUsedHeroPowerThisTurn &&
			this.heroPowerBlockers.length <= 0
		);
	}

	/**
	 * @returns If this player is alive
	 */
	isAlive(): boolean {
		return this.health > 0;
	}

	/**
	 * @returns The remaining board space for this player.
	 */
	getRemainingBoardSpace(): number {
		return game.config.general.maxBoardSpace - this.board.length;
	}

	/**
	 * @returns The remaining hand size for this given player.
	 */
	getRemainingHandSpace(): number {
		return game.config.general.maxHandLength - this.hand.length;
	}

	/**
	 * Returns true if the player has the correct runes
	 *
	 * @param runes The runes to test against
	 *
	 * @returns Whether or not the player has the correct runes
	 */
	testRunes(runes: Rune[]): boolean {
		if (runes.length <= 0 || this.runes.length <= 0) {
			return false;
		}

		const requiredBlood = runes.filter((r) => r === Rune.Blood).length;
		const requiredFrost = runes.filter((r) => r === Rune.Frost).length;
		const requiredUnholy = runes.filter((r) => r === Rune.Unholy).length;

		const blood = this.runes.filter((r) => r === Rune.Blood).length;
		const frost = this.runes.filter((r) => r === Rune.Frost).length;
		const unholy = this.runes.filter((r) => r === Rune.Unholy).length;

		if (
			requiredBlood > blood ||
			requiredFrost > frost ||
			requiredUnholy > unholy
		) {
			return false;
		}

		return true;
	}

	/**
	 * Mulligans the cards from input. Read `interact.mulligan` for more info.
	 *
	 * @param input The ids of the cards to mulligan
	 *
	 * @returns The cards mulligan'd
	 */
	async mulligan(input: string): Promise<Card[]> {
		if (input === "") {
			return [];
		}

		if (!game.lodash.parseInt(input)) {
			await game.pause("<red>Invalid input!</red>\n");
			return this.mulligan(input);
		}

		const cards: Card[] = [];
		const mulligan: Card[] = [];

		for (const character of input) {
			mulligan.push(this.hand[game.lodash.parseInt(character) - 1]);
		}

		for (const card of this.hand) {
			// The Coin card shouldn't be mulligan'd
			if (!mulligan.includes(card) || card.id === 2) {
				continue;
			}

			game.functions.util.remove(mulligan, card);

			await game.event.withSuppressed(Event.DrawCard, async () =>
				this.drawCards(1),
			);
			await game.event.withSuppressed(Event.AddCardToDeck, async () =>
				this.shuffleIntoDeck(card),
			);
			await game.event.withSuppressed(Event.DiscardCard, async () =>
				card.discard(),
			);

			cards.push(card);
		}

		return cards;
	}

	/**
	 * Creates and returns a jade golem with the correct stats and cost for this player
	 *
	 * @returns The jade golem
	 */
	async createJade(): Promise<Card> {
		if (this.jadeCounter < 30) {
			this.jadeCounter += 1;
		}

		const count = this.jadeCounter;
		const cost = count < 10 ? count : 10;

		const jade = await Card.create(game.cardIds.jadeGolem_85, this);
		await jade.setStats(count, count);
		jade.cost = cost;

		return jade;
	}

	/**
	 * Discards `card` from this player's hand.
	 *
	 * Equivalent to `card.discard()`.
	 *
	 * @returns If the card was successfully discarded
	 */
	async discard(card: Card): Promise<boolean> {
		return card.discard(this);
	}

	/**
	 * Calls `callback` on all this player's targets, including the player itself.
	 *
	 * @param callback The callback to call
	 *
	 * @returns Success
	 */
	doTargets(callback: (target: Target) => void): boolean {
		for (const card of this.board) {
			callback(card);
		}

		callback(this);
		return true;
	}

	/**
	 * @returns If this player's deck has no duplicates.
	 */
	highlander(): boolean {
		const deck = this.deck.map((c) => c.id);

		return new Set(deck).size === deck.length;
	}

	/**
	 * Progress a quest by a value
	 *
	 * @param name The name of the quest
	 * @param value The amount to progress the quest by
	 *
	 * @returns The new progress
	 */
	progressQuest(name: string, value = 1): number | undefined {
		let quest = this.secrets.find((s) => s.name === name);
		if (!quest) {
			quest = this.sidequests.find((s) => s.name === name);
		}

		if (!quest) {
			quest = this.quests.find((s) => s.name === name);
		}

		if (!quest) {
			return undefined;
		}

		quest.progress[0] += value;

		return quest.progress[0];
	}

	/**
	 * Adds a quest / secrets to a player
	 *
	 * @param type The type of the quest
	 * @param card The card that created the quest / secret
	 * @param key The key to listen for
	 * @param amount The amount of times that the quest is triggered before being considered complete
	 * @param callback The function to call when the key is invoked.
	 * @param next The id of the next quest / sidequest / secret that should be added when the quest is done
	 *
	 * @returns Success
	 */
	async addQuest<E extends Event>(
		type: QuestType,
		card: Card,
		key: E,
		amount: number,
		callback: QuestCallback<E>,
		next?: number,
	): Promise<boolean> {
		let quests: QuestObject<E>[];

		switch (type) {
			case QuestType.Quest: {
				quests = this.quests as QuestObject<E>[];
				break;
			}

			case QuestType.Sidequest: {
				quests = this.sidequests as QuestObject<E>[];
				break;
			}

			case QuestType.Secret: {
				quests = this.secrets as QuestObject<E>[];
				break;
			}

			default: {
				return false;
			}
		}

		if (
			(type === QuestType.Quest && quests.length > 0) ||
			((type === QuestType.Secret || type === QuestType.Sidequest) &&
				(quests.length >= 3 || quests.some((s) => s.name === card.name)))
		) {
			await this.addToHand(card);
			this[card.costType] += card.cost;
			return false;
		}

		quests.push({
			name: card.name,
			progress: [0, amount],
			key,
			value: amount,
			callback,
			next,
		});

		return true;
	}

	/**
	 * Invoke this player's Galakrond
	 *
	 * @returns Success
	 */
	async invoke(): Promise<boolean> {
		const isCurrentlyGalakrond = this.hero.tags.includes(CardTag.Galakrond);

		const hasGalakrondInDeck = this.deck.find((c) =>
			c.tags.includes(CardTag.Galakrond),
		);

		const hasGalakrondInHand = this.hand.find((c) =>
			c.tags.includes(CardTag.Galakrond),
		);

		if (!hasGalakrondInDeck && !hasGalakrondInHand && !isCurrentlyGalakrond) {
			return false;
		}

		for (const card of this.deck) {
			await card.trigger(Ability.Invoke);
		}

		for (const card of this.hand) {
			await card.trigger(Ability.Invoke);
		}

		for (const card of this.board) {
			await card.trigger(Ability.Invoke);
		}

		if (isCurrentlyGalakrond) {
			await this.hero.heropower?.trigger(Ability.Cast);
		} else if (hasGalakrondInDeck) {
			await hasGalakrondInDeck.heropower?.trigger(Ability.Cast);
		} else if (hasGalakrondInHand) {
			await hasGalakrondInHand.heropower?.trigger(Ability.Cast);
		}

		return true;
	}

	/**
	 * Chooses a minion from `list` and puts it onto the board.
	 *
	 * @param list The list to recruit from.
	 * @param amount The amount of minions to recruit.
	 *
	 * @returns Returns the cards recruited.
	 */
	async recruit(
		list: Card[],
		amount = 1,
		filterPredicate = (card: Card) => true,
	): Promise<Card[]> {
		const recruitList = game.lodash
			.shuffle([...list])
			.filter((c) => c.type === Type.Minion && filterPredicate(c));

		let times = 0;
		const cards: Card[] = [];

		for (const card of recruitList) {
			if (times >= amount) {
				continue;
			}

			await card.reset();
			await this.summon(card);

			times++;
			cards.push(card);
			game.functions.util.remove(list, card);
		}

		return cards;
	}

	/**
	 * Starts a joust.
	 * Reveals a random card from each player's deck.
	 * If the cost of this player's card is higher than the cost of the opponent's card, this player wins.
	 *
	 * @param predicate The predicate to filter cards in both players' deck. Defaults to `() => true`
	 * @param winCondition The win condition. `c1` is the friendly card, `c2` is the enemy card. Defaults to `(c1, c2) => c1.cost > c2.cost`
	 *
	 * @returns If this player won the joust
	 */
	async joust(
		predicate: (card: Card) => boolean = () => true,
		winCondition: (c1: Card, c2: Card) => boolean = (c1, c2) =>
			c1.cost > c2.cost,
	): Promise<boolean> {
		// Select a random card from both player's deck.
		const friendlyCard = game.lodash.sample(
			this.deck.filter((card) => predicate?.(card)),
		);

		const enemyCard = game.lodash.sample(
			this.getOpponent().deck.filter((card) => predicate?.(card)),
		);

		/*
		 * Check if both players have cards. If not, don't reveal them.
		 * The logic is found here: https://hearthstone.wiki.gg/wiki/Joust
		 */
		if (!friendlyCard && !enemyCard) {
			// None of the players have targets. Lose the joust
			return false;
		}

		if (!friendlyCard) {
			// Friendly player has no card. Lose the joust
			return false;
		}

		if (!enemyCard) {
			// Enemy player has no card. Win the joust
			return true;
		}

		// Check which card has the higher cost
		const win = winCondition(friendlyCard, enemyCard);

		// Shuffle the decks of both players
		this.shuffleDeck();
		this.getOpponent().shuffleDeck();

		// Reveal them to both players
		await game.event.broadcast(Event.RevealCard, [friendlyCard, "Joust"], this);
		await game.event.broadcast(Event.RevealCard, [enemyCard, "Joust"], this);

		console.log("\n--- JOUST ---");
		console.log("Yours: %s", await friendlyCard.readable());
		console.log("Opponent: %s", await enemyCard.readable());
		console.log("-------------");

		console.log(win ? "You win!" : "You lose!");
		await game.pause("");

		return win;
	}

	/**
	 * Summon a card.
	 * Broadcasts the `SummonCard` event
	 *
	 * @param card The card to summon
	 * @param colossal If the card has colossal, summon the other cards.
	 *
	 * @returns The card summoned
	 */
	summon(card: Card, colossal = true) {
		return game.summon(card, this, colossal);
	}

	/**
	 * Makes this player attack a minion or hero
	 *
	 * This is just a shortcut for `game.attack(this, target, flags)`. Whether to use this or `game.attack` is up to you and your preferences.
	 *
	 * @param target The target
	 * @param flags An object with boolean properties to modify the behavior of the attack (e.g., { force: true })
	 *
	 * @returns Success | Errorcode
	 */
	attackTarget(target: Target, flags: GameAttackFlags = {}) {
		return game.attack(this, target, flags);
	}

	/**
	 * Spawns a DIY card for this player.
	 */
	async spawnInDIYCard(): Promise<void> {
		// Don't allow ai's to get diy cards
		if (this.ai) {
			return;
		}

		const list = await Card.allWithTags(CardTag.DIY);

		const card = game.lodash.sample(list);
		if (!card) {
			return;
		}

		card.owner = this;
		await this.addToHand(card);
	}
}
