/**
 * Player
 * @module Player
 */
import { type Ai, Card } from '../internal.js';
import { type CardClass, type CardType, type EventKey, type QuestCallback, type QuestType, type Target } from '../types.js';

export class Player {
    /**
     * You might be looking for `Player.id`.
     *
     * The player's name. For example: "Player 1".
     *
     * There is no real use for this outside of the source code, so i would advise you to not use this.
     */
    name = 'Unknown';

    /**
     * This is:
     *
     * 0: if this is the starting player
     *
     * 1: if this is the player that starts with the coin
     *
     * You can use this in `game.board[Player.id]` in order to get this player's side of the board.
     *
     * # Examples
     * @example
     * const board = game.board[player.id];
     *
     * board.forEach(card => {
     *     game.log(card.name);
     * });
     */
    id = -1;

    /**
     * The player's AI.
     *
     * # Examples
     * @example
     * const discover = player.ai.discover();
     *
     * game.log(discover);
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
     * player.deck.forEach(card => {
     *     game.log(card.name);
     * });
     */
    deck: Card[] = [];

    /**
     * The player's hand.
     *
     * # Examples
     * @example
     * player.hand.forEach(card => {
     *     game.log(card.name);
     * });
     */
    hand: Card[] = [];

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
     * // Now `player.maxMana` will increment every turn until it reaches 20.
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
     * // Use `player.remHealth(3)` instead in a real situation.
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
     * player.hero.activate("heropower");
     * ```
     */
    hero?: Card;

    /**
     * The class the player is. This is set to either: Mage, Priest, Warlock, Warrior, ...
     */
    heroClass: CardClass = 'Mage';

    /**
     * How much the player's hero power costs.
     */
    heroPowerCost = 2;

    /**
     * If the player can use their hero power.
     */
    canUseHeroPower = true;

    /**
     * The player's weapon. Functions like any other card.
     *
     * # Examples
     * ```
     * // Use `player.destroyWeapon()` instead in a real situation.
     * player.weapon.kill();
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
    counter: CardType[] = [];

    /**
     * The secrets that the player has.
     */
    secrets: QuestType[] = [];

    /**
     * The sidequests that the player has.
     */
    sidequests: QuestType[] = [];

    /**
     * The quest that the player has.
     */
    quests: QuestType[] = [];

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
     * A three letter rune combination. For example "BBB" for 3 blood runes, or "BFU" for one of each rune.
     */
    runes = '';

    /**
     * If this is not null, it will automatically choose this target when asked instead of asking the player.
     *
     * # Example
     * ```
     * player.forceTarget = target;
     * const chosen = game.interact.selectTarget("Example", null, "any", "any");
     * player.forceTarget = null;
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

    constructor(name: string) {
        this.name = name;
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
     * @returns Success
     */
    refreshMana(mana: number, comp?: number): boolean {
        if (!comp) {
            comp = this.emptyMana;
        }

        this.mana += mana;

        if (this.mana > comp) {
            this.mana = comp;
        }

        return true;
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
     * @returns Success
     */
    addEmptyMana(mana: number): boolean {
        this.emptyMana += mana;

        if (this.emptyMana > this.maxMana) {
            this.emptyMana = this.maxMana;
        }

        return true;
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
     * @returns Success
     */
    addMana(mana: number): boolean {
        this.addEmptyMana(mana);
        this.refreshMana(mana);

        return true;
    }

    /**
     * Increases the players overload by `overload`. Overload will not take into affect until the player's next turn.
     *
     * ```
     * assert.equal(player.overload, 0);
     *
     * player.addOverload(2);
     *
     * assert.equal(player.overload, 2);
     * ```
     *
     * @param overload The amount of overload to add
     *
     * @returns Success
     */
    addOverload(overload: number): boolean {
        this.overload += overload;

        game.events.broadcast('GainOverload', overload, this);

        return true;
    }

    // Weapons

    /**
     * Sets this player's weapon to `weapon`
     *
     * # Examples
     * ```
     * const weapon = new Card("some weapon name", player);
     * player.setWeapon(weapon);
     * ```
     *
     * @param weapon The weapon to set
     *
     * @returns Success
     */
    setWeapon(weapon: Card): boolean {
        this.destroyWeapon();
        this.weapon = weapon;
        this.attack += weapon.getAttack();

        return true;
    }

    /**
     * Destroys this player's weapon
     *
     * # Examples
     * ```
     * // Assume the player has a weapon with 5 attack and the player hasn't attacked this turn.
     * assert.equal(player.weapon.getAttack(), 5);
     * assert.equal(player.attack, 5);
     *
     * player.destroyWeapon();
     *
     * assert.equal(player.weapon, null);
     * assert.equal(player.attack, 0);
     * ```
     *
     * @returns Success
     */
    destroyWeapon(): boolean {
        if (!this.weapon) {
            return false;
        }

        this.weapon.activate('deathrattle');
        this.attack -= this.weapon.getAttack();

        this.weapon.destroy();
        this.weapon = undefined;

        return true;
    }

    // Stats

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
    addAttack(amount: number): boolean {
        this.attack += amount;

        game.events.broadcast('GainHeroAttack', amount, this);

        return true;
    }

    /**
     * Increases the player's health by `amount`
     *
     * @param amount The amount the player's health should increase by
     *
     * @returns Success
     */
    addHealth(amount: number): boolean {
        this.health += amount;

        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }

        return true;
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
    remHealth(amount: number): boolean {
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

        // The amount of damage to take is however much damage penetrated the armor.
        // The remaining armor is negative, so turn it into a positive number so it's easier to work with
        amount = -remainingArmor;

        this.health -= amount;

        game.events.broadcast('TakeDamage', amount, this);

        if (this.health <= 0) {
            game.events.broadcast('FatalDamage', undefined, this);

            if (this.health <= 0) { // This is done to allow secrets to prevent death
                game.endGame(this.getOpponent());
            }
        }

        return true;
    }

    /**
     * Returns this player's health.
     */
    getHealth(): number {
        // I have this here for compatibility with minions
        return this.health;
    }

    /**
     * Returns this player's attack.
     */
    getAttack(): number {
        // I have this here for compatibility with minions
        return this.attack;
    }

    // Hand / Deck

    /**
     * Shuffle a card into this player's deck. This will shuffle the deck.
     * Broadcasts the `AddCardToDeck` event.
     *
     * ```
     * assert.equal(player.deck.length, 30);
     *
     * card = new Card("Sheep", player);
     * player.shuffleIntoDeck(card);
     *
     * assert.equal(player.deck.length, 31);
     * ```
     *
     * @param card The card to shuffle
     *
     * @returns Success
     */
    shuffleIntoDeck(card: Card): boolean {
        // Add the card into a random position in the deck
        const pos = game.lodash.random(0, this.deck.length);
        this.deck.splice(pos, 0, card);

        game.events.broadcast('AddCardToDeck', card, this);

        this.deck = game.lodash.shuffle(this.deck);

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
    addToBottomOfDeck(card: Card): boolean {
        this.deck = [card, ...this.deck];

        game.events.broadcast('AddCardToDeck', card, this);

        return true;
    }

    /**
     * Draws the card from the top of this player's deck.
     * Broadcasts the `DrawCard` event
     *
     * @returns The card drawn | The amount of fatigue the player was dealt
     */
    drawCard(): Card | number {
        const deckLength = this.deck.length;

        /**
         * The card to draw
         */
        const card = this.deck.pop();

        if (deckLength <= 0 || !card) {
            this.fatigue++;

            this.remHealth(this.fatigue);
            return this.fatigue;
        }

        game.events.broadcast('DrawCard', card, this);

        // Cast on draw
        if (card.type === 'Spell' && card.hasKeyword('Cast On Draw') && card.activate('cast')) {
            return this.drawCard();
        }

        const unsuppress = game.functions.event.suppress('AddCardToHand');
        this.addToHand(card);
        unsuppress();

        return card;
    }

    /**
     * Draws a specific card from this player's deck.
     * Broadcasts the `DrawCard` event
     *
     * # Examples
     * This works
     * ```
     * // Get a random card from the player's deck
     * const card = game.functions.randList(player.deck).actual;
     *
     * player.drawSpecific(card);
     * ```
     *
     * This doesn't work
     * ```
     * const card = game.functions.randList(player.deck).copy;
     *
     * player.drawSpecific(card);
     * ```
     *
     * @param card The card to draw
     *
     * @returns The card drawn
     */
    drawSpecific(card: Card): Card | undefined {
        if (this.deck.length <= 0) {
            return undefined;
        }

        game.functions.util.remove(this.deck, card);
        game.events.broadcast('DrawCard', card, this);

        if (card.type === 'Spell' && card.hasKeyword('Cast On Draw') && card.activate('cast')) {
            return undefined;
        }

        const unsuppress = game.functions.event.suppress('AddCardToHand');
        this.addToHand(card);
        unsuppress();

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
    addToHand(card: Card): boolean {
        if (this.hand.length >= game.config.general.maxHandLength) {
            return false;
        }

        this.hand.push(card);

        game.events.broadcast('AddCardToHand', card, this);
        return true;
    }

    // Hero power / Class

    /**
     * Sets the player's hero to `hero`
     *
     * @param hero The hero that the player should be set to
     * @param armor The amount of armor the player should gain
     * @param setHeroClass Set the players hero class.
     *
     * @returns Success
     */
    setHero(hero: Card, armor = 5, setHeroClass = true): boolean {
        this.hero = hero;
        if (setHeroClass) {
            this.heroClass = hero.classes[0];
        }

        this.heroPowerCost = hero.hpCost ?? 2;

        this.armor += armor;
        return true;
    }

    /**
     * Sets the player's hero to the default hero of `heroClass`
     *
     * @param heroClass The class of the hero. This defaults to the player's class.
     *
     * @returns Success
     */
    setToStartingHero(heroClass = this.heroClass): boolean {
        const heroCardName = heroClass + ' Starting Hero';
        const heroCard = game.functions.card.getFromName(heroCardName);

        if (!heroCard) {
            return false;
        }

        this.setHero(new Card(heroCard.name, this), 0, false);

        return true;
    }

    /**
     * Activate the player's hero power.
     *
     * @returns Success | Cancelled
     */
    heroPower(): boolean | -1 {
        if (this.mana < this.heroPowerCost || !this.canUseHeroPower) {
            return false;
        }

        if (!this.hero) {
            return false;
        }

        if (this.hero.activate('heropower') === game.constants.refund) {
            return -1;
        }

        for (const m of game.board[this.id]) {
            m.activate('inspire');
        }

        this.mana -= this.heroPowerCost;
        this.canUseHeroPower = false;

        game.events.broadcast('HeroPower', this.heroClass, this);
        return true;
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
        if (this.heroClass !== 'Death Knight') {
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
     * Returns true if the player has the correct runes
     *
     * @param runes The runes to test against
     *
     * @returns Whether or not the player has the correct runes
     */
    testRunes(runes: string): boolean {
        const charCount = (text: string, letter: string) => {
            let letterCount = 0;

            for (let i = 0; i < text.length; i++) {
                if (text.charAt(i) === letter) {
                    letterCount++;
                }
            }

            return letterCount;
        };

        const blood = charCount(runes, 'B');
        const frost = charCount(runes, 'F');
        const unholy = charCount(runes, 'U');

        const b = charCount(this.runes, 'B');
        const f = charCount(this.runes, 'F');
        const u = charCount(this.runes, 'U');

        if (blood > b || frost > f || unholy > u) {
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
    mulligan(input: string): Card[] | TypeError {
        if (!game.lodash.parseInt(input)) {
            return new TypeError('Can\'t parse `input` to int');
        }

        const cards: Card[] = [];
        const mulligan: Card[] = [];

        for (const c of input) {
            mulligan.push(this.hand[game.lodash.parseInt(c) - 1]);
        }

        for (const c of this.hand) {
            if (!mulligan.includes(c) || c.name === 'The Coin') {
                continue;
            }

            game.functions.util.remove(mulligan, c);

            let unsuppress = game.functions.event.suppress('DrawCard');
            this.drawCard();
            unsuppress();

            unsuppress = game.functions.event.suppress('AddCardToDeck');
            this.shuffleIntoDeck(c);
            unsuppress();

            game.functions.util.remove(this.hand, c);

            cards.push(c);
        }

        return cards;
    }

    /**
     * Calls `callback` on all this player's targets, including the player itself.
     *
     * @param callback The callback to call
     *
     * @returns Success
     */
    doTargets(callback: (target: Target) => void): boolean {
        for (const m of game.board[this.id]) {
            callback(m);
        }

        callback(this);

        return true;
    }

    /**
     * Returns if this player's deck has no duplicates.
     */
    highlander(): boolean {
        const deck = this.deck.map(c => c.name);

        return (new Set(deck)).size === deck.length;
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
        let quest = this.secrets.find(s => s.name === name);
        if (!quest) {
            quest = this.sidequests.find(s => s.name === name);
        }

        if (!quest) {
            quest = this.quests.find(s => s.name === name);
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
     * @param next The name of the next quest / sidequest / secret that should be added when the quest is done
     *
     * @returns Success
     */
    addQuest(type: 'Quest' | 'Sidequest' | 'Secret', card: Card, key: EventKey, amount: number, callback: QuestCallback, next?: string): boolean {
        let t;

        switch (type) {
            case 'Quest': {
                t = this.quests;
                break;
            }

            case 'Sidequest': {
                t = this.sidequests;
                break;
            }

            case 'Secret': {
                t = this.secrets;
                break;
            }

            default: {
                return false;
            }
        }

        if ((type.toLowerCase() === 'quest' && t.length > 0) || ((type.toLowerCase() === 'secret' || type.toLowerCase() === 'sidequest') && (t.length >= 3 || t.some(s => s.name === card.displayName)))) {
            this.addToHand(card);
            return false;
        }

        t.push({ name: card.displayName, progress: [0, amount], key, value: amount, callback, next });
        return true;
    }

    /**
     * Invoke this player's Galakrond
     *
     * @returns Success
     */
    invoke(): boolean {
        // Find the card in player's deck/hand/hero that begins with "Galakrond, the "
        const deckGalakrond = this.deck.find(c => c.displayName.startsWith('Galakrond, the '));
        const handGalakrond = this.hand.find(c => c.displayName.startsWith('Galakrond, the '));
        if ((!deckGalakrond && !handGalakrond) && !this.hero?.displayName.startsWith('Galakrond, the ')) {
            return false;
        }

        for (const c of this.deck) {
            c.activate('invoke');
        }

        for (const c of this.hand) {
            c.activate('invoke');
        }

        for (const c of game.board[this.id]) {
            c.activate('invoke');
        }

        if (this.hero?.displayName.startsWith('Galakrond, the ')) {
            this.hero.activate('heropower');
        } else if (deckGalakrond) {
            deckGalakrond.activate('heropower');
        } else if (handGalakrond) {
            handGalakrond.activate('heropower');
        }

        return true;
    }

    /**
     * Chooses a minion from `list` and puts it onto the board.
     *
     * @param list The list to recruit from. This defaults to `plr`'s deck.
     * @param amount The amount of minions to recruit
     *
     * @returns Returns the cards recruited
     */
    recruit(list?: Card[], amount = 1): Card[] {
        if (!list) {
            list = this.deck;
        }

        const _list = list;

        list = game.lodash.shuffle([...list]);

        let times = 0;
        const cards: Card[] = [];

        list = list.filter(c => c.type === 'Minion');
        for (const c of list) {
            if (times >= amount) {
                continue;
            }

            game.summonMinion(c.imperfectCopy(), this);

            times++;
            cards.push(c);
        }

        for (const c of cards) {
            game.functions.util.remove(_list, c);
        }

        return cards;
    }
}
