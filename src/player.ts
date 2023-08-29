import { AI } from "./ai";
import { Card } from "./card";
import { Game } from "./game";
import { get } from "./shared";
import { CardClass, CardType, QuestType, Target } from "./types";

let game: Game;

export class Player {
    /**
     * You might be looking for `Player.id`.
     * 
     * The player's name. For example: "Player 1".
     * 
     * There is no real use for this outside of the source code, so i would advise you to not use this.
     */
    name: string;

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
     * let board = game.board[player.id];
     * 
     * board.forEach(card => {
     *     console.log(card.name);
     * });
     */
    id: number = -1;

    /**
     * The player's AI.
     * 
     * # Examples
     * @example
     * let discover = player.ai.discover();
     * 
     * console.log(discover);
     */
    ai?: AI;

    /**
     * How much damage the player gets damaged the next time they draw a card from an empty deck.
     * 
     * This increments every time a player draws from an empty deck.
     */
    fatigue: number = 0;

    /**
     * The class type of the player. This is always `Player`.
     * 
     * You can use this if the type of a variable is ambigious (Card | Player) since the Card class always has this variable set to `Card`.
     * 
     * # Examples
     * @example
     * let target = game.functions.selectTarget("Example", null, null, null);
     * 
     * if (target.classType == "Player") {
     *     console.log(target.health);
     * } else if (target.classType == "Card") {
     *     console.log(target.stats[1]);
     * }
     * 
     * // ^^^ You can just use `target.getHealth()` in this situation since both classes have it.
     */
    classType: "Player" = "Player";

    /**
     * The player's deck.
     * 
     * This can be shuffled at any time so don't rely on the order of the cards.
     * 
     * # Examples
     * @example
     * player.deck.forEach(card => {
     *     console.log(card.name);
     * });
     */
    deck: Card[] = [];

    /**
     * The player's hand.
     * 
     * # Examples
     * @example
     * player.hand.forEach(card => {
     *     console.log(card.name);
     * });
     */
    hand: Card[] = [];

    /**
     * The amount of mana that the player CURRENTLY has.
     * 
     * # Examples
     * @example
     * // Use `player.refreshMana(2, player.maxMaxMana)` instead in a real situation.
     * player.mana += 2;
     */
    mana: number = 0;

    /**
     * The max amount of mana the player has. This increments every turn until it reaches `player.maxMaxMana`.
     * 
     * # Examples
     * @example
     * // Use `player.gainEmptyMana(2)` instead in a real situation.
     * player.maxMana += 2;
     */
    maxMana: number = 0;
    
    /**
     * The max amount of max mana the player can have. This is normally fixed at `10` but can be changed.
     * 
     * # Examples
     * ```
     * player.maxMaxMana = 20;
     * // Now `player.maxMana` will increment every turn until it reaches 20.
     * ```
     */
    maxMaxMana: number = 10;

    /**
     * The amount of overload the player has. See the overload mechanic on the Hearthstone Wiki.
     * 
     * # Examples
     * ```
     * // Use `player.gainOverload(2)` instead in a real situation.
     * player.overload += 2;
     * // Now the player will have 2 less mana next turn.
     * ```
     */
    overload: number = 0;

    /**
     * The amount of health the player has.
     * 
     * # Examples
     * ```
     * // Use `player.remHealth(3)` instead in a real situation.
     * player.health -= 3;
     * ```
     */
    health: number = 30;

    /**
     * The maximum health the player can have. This is normally fixed to the amount of health the player starts with (`30`).
     * 
     * # Examples
     * ```
     * player.maxHealth = 40;
     * ```
     */
    maxHealth: number = 30;

    /**
     * The amount of armor the player has.
     * 
     * # Examples
     * ```
     * player.armor += 3;
     * ```
     */
    armor: number = 0;

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
    heroClass: CardClass = "Mage";

    /**
     * How much the player's hero power costs.
     */
    heroPowerCost: number = 2;

    /**
     * If the player can use their hero power.
     */
    canUseHeroPower: boolean = true;

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
    canAttack: boolean = true;

    /**
     * If the player is frozen.
     * 
     * If a player is frozen, they can't attack.
     */
    frozen: boolean = false;

    /**
     * If the player is immune to damage.
     */
    immune: boolean = false;

    /**
     * How much attack the player has.
     */
    attack: number = 0;

    /**
     * How much spell damage the player has.
     */
    spellDamage: number = 0;

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
    jadeCounter: number = 0;

    /**
     * How many corpses the player has.
     * 
     * This increases even if the player is not a Death Knight, so don't count on this number telling you if the player is a Death Knight or not.
     */
    corpses: number = 0;

    /**
     * A three letter rune combination. For example "BBB" for 3 blood runes, or "BFU" for one of each rune.
     */
    runes: string = "";

    /**
     * If this is not null, it will automatically choose this target when asked instead of asking the player.
     * 
     * # Example
     * ```
     * player.forceTarget = target;
     * let chosen = game.interact.selectTarget("Example", null, null, null);
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
    detailedView: boolean = false;

    constructor(name: string) {
        this.getInternalGame();

        this.name = name;
    }

    /**
     * Update the `game` variable stored in the player module.
     * 
     * I don't recommend calling this because it can cause major problems if done incorrectly.
     */
    getInternalGame(): void {
        let tempGame = get();
        if (!tempGame) return;

        game = tempGame;
    }

    /**
     * Get this player's opponent
     * 
     * # Examples
     * ```
     * let opponent = player.getOpponent();
     * 
     * assert.notEqual(player.id, opponent.id);
     * ```
     */
    getOpponent(): Player {
        if (this.id === 0) return game.player2;
        else return game.player1; // We always need to return a player.
    }

    // Mana

    /**
     * Adds `mana` to this player, without going over `comp` mana.
     * 
     * # Examples
     * ```
     * assert.equal(player.maxMana, 7);
     * assert.equal(player.mana, 5);
     * 
     * player.refreshMana(10);
     * 
     * assert.equal(player.mana, 7);
     * ```
     * If comp is `player.maxMaxMana`
     * ```
     * assert.equal(player.maxMana, 7);
     * assert.equal(player.mana, 5);
     * 
     * player.refreshMana(10, player.maxMaxMana);
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
     * @param comp The comperison. This defaults to `player.maxMana`.
     * 
     * @returns Success
     */
    refreshMana(mana: number, comp?: number): boolean {
        if (!comp) comp = this.maxMana;

        this.mana += mana;

        if (this.mana > comp) this.mana = comp;

        return true;
    }

    /**
     * Increases max mana by `mana`, then if `cap` is true; avoid going over `player.maxMaxMana` (10) mana.
     * 
     * # Examples
     * ```
     * assert.equal(player.maxMana, 5);
     * 
     * player.gainEmptyMana(10);
     * 
     * assert.equal(player.maxMana, 15);
     * ```
     * If you set `cap` to true
     * ```
     * assert.equal(player.maxMana, 5);
     * 
     * player.gainEmptyMana(10, true);
     * 
     * assert.equal(player.maxMana, 10);
     * ```
     * 
     * @param mana The empty mana to add.
     * @param cap Should prevent going over max max mana
     * 
     * @returns Success 
     */
    gainEmptyMana(mana: number, cap = false): boolean {
        this.maxMana += mana;

        if (cap && this.maxMana > this.maxMaxMana) this.maxMana = this.maxMaxMana;

        return true;
    }

    /**
     * Increases both mana and max mana by `mana`.
     * 
     * This function runs
     * ```
     * player.gainEmptyMana(mana, cap);
     * player.refreshMana(mana);
     * ```
     * so look at these functions for more info.
     * 
     * @param mana The number to increase mana and max mana by
     * @param cap Should prevent max mana going over max max mana (10)
     * 
     * @returns Success
     */
    gainMana(mana: number, cap = false): boolean {
        this.gainEmptyMana(mana, cap);
        this.refreshMana(mana);

        return true;
    }

    /**
     * Increases the players overload by `overload`. Overload will not take into affect until the player's next turn.
     * 
     * ```
     * assert.equal(player.overload, 0);
     * 
     * player.gainOverload(2);
     * 
     * assert.equal(player.overload, 2);
     * ```
     * 
     * @param overload The amount of overload to add
     * 
     * @returns Success
     */
    gainOverload(overload: number): boolean {
        this.overload += overload;

        game.events.broadcast("GainOverload", overload, this);

        return true;
    }

    // Weapons

    /**
     * Sets this player's weapon to `weapon`
     * 
     * # Examples
     * ```
     * let weapon_name = "some weapon name";
     * 
     * let weapon = new Card(weapon_name, player);
     * player.setWeapon(weapon); 
     * ```
     * 
     * @param weapon The weapon to set
     * 
     * @returns Success
     */
    setWeapon(weapon: Card): boolean {
        this.destroyWeapon(true);
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
     * player.destroyWeapon(false); // Don't trigger the card's deathrattle. This is the default.
     * 
     * assert.equal(player.weapon, null);
     * assert.equal(player.attack, 0);
     * ```
     * 
     * @param triggerDeathrattle Should trigger the weapon's deathrattle
     * 
     * @returns Success
     */
    destroyWeapon(triggerDeathrattle = false): boolean {
        if (!this.weapon) return false;

        if (triggerDeathrattle) this.weapon.activate("deathrattle");
        this.attack -= this.weapon.getAttack();
        this.weapon.destroy();
        this.weapon = undefined;

        return true;
    }

    // Stats

    /**
     * Increases the player's attack by `amount`.
     * 
     * @param amount The amount the player's attack should increase by
     * 
     * @returns Success
     */
    addAttack(amount: number): boolean {
        this.attack += amount;

        game.events.broadcast("GainHeroAttack", amount, this);

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

        if (this.health > this.maxHealth) this.health = this.maxHealth;

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
        if (this.immune) return true;

        // Armor logic
        let remainingArmor = this.armor - amount;
        this.armor = Math.max(remainingArmor, 0);

        // Armor blocks all damage, return true since there were no errors.
        if (remainingArmor >= 0) return true;

        // The amount of damage to take is however much damage penetrated the armor.
        // The remaining armor is negative, so turn it into a positive number so it's easier to work with
        amount = -remainingArmor;

        this.health -= amount;

        game.events.broadcast("TakeDamage", [this, amount], this);

        if (this.health <= 0) {
            game.events.broadcast("FatalDamage", null, this);

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
        let pos = game.functions.randInt(0, this.deck.length);
        this.deck.splice(pos, 0, card);

        game.events.broadcast("AddCardToDeck", card, this);

        this.deck = game.functions.shuffle(this.deck);

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

        game.events.broadcast("AddCardToDeck", card, this);

        return true;
    }

    /**
     * Draws the card from the top of this player's deck.
     * Broadcasts the `DrawCard` event
     * 
     * @returns The card drawn | The amount of fatigue the player was dealt
     */
    drawCard(): Card | number {
        let deck_length = this.deck.length;
        
        /**
         * The card to draw
         */
        let card = this.deck.pop();

        if (deck_length <= 0 || !(card instanceof Card)) {
            this.fatigue++;

            this.remHealth(this.fatigue);
            return this.fatigue;
        }

        game.events.broadcast("DrawCard", card, this);

        // Cast on draw
        if (card.type == "Spell" && card.keywords.includes("Cast On Draw") && card.activate("cast")) return this.drawCard();

        game.suppressedEvents.push("AddCardToHand");
        this.addToHand(card);
        game.suppressedEvents.pop();

        return card;
    }

    /**
     * Draws a specific card from this player's deck.
     * Broadcasts the `DrawCard` event
     * 
     * # Examples
     * ```
     * // Get a random card from the player's deck, but do not run `card.perfectCopy` on it.
     * let card = game.functions.randList(player.deck, false);
     * 
     * player.drawSpecific(card);
     * ```
     * 
     * @param card The card to draw
     * 
     * @returns The card drawn | Is undefined if the card wasn't found
     */
    drawSpecific(card: Card): Card | null {
        if (this.deck.length <= 0) return null;

        //this.deck = this.deck.filter(c => c !== card);
        game.functions.remove(this.deck, card);

        game.events.broadcast("DrawCard", card, this);

        if (card.type == "Spell" && card.keywords.includes("Cast On Draw") && card.activate("cast")) return null;

        game.suppressedEvents.push("AddCardToHand");
        this.addToHand(card);
        game.suppressedEvents.pop();

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
        if (this.hand.length >= 10) return false;
        this.hand.push(card);

        game.events.broadcast("AddCardToHand", card, this);
        return true;
    }

    /**
     * @deprecated Use `game.functions.remove(player.hand, card)` instead.
     * 
     * Removes a card from the player's hand
     * 
     * @param card The card to remove
     * 
     * @returns Success
     */
    removeFromHand(card: Card): boolean {
        this.hand = this.hand.filter(c => c !== card);
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
        if (setHeroClass) this.heroClass = hero.class;
        this.heroPowerCost = hero.hpCost || 2;

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
        let heroCardName = heroClass + " Starting Hero";
        let heroCard = game.functions.getCardByName(heroCardName);

        if (!heroCard) return false;
        this.setHero(new Card(heroCard.name, this), 0, false);

        return true;
    }

    /**
     * Activate the player's hero power.
     * 
     * @returns Success | Cancelled
     */
    heroPower(): boolean | -1 {
        if (this.mana < this.heroPowerCost || !this.canUseHeroPower) return false;
        if (!this.hero) return false;

        if (this.hero.activate("heropower") == game.constants.REFUND) return -1;

        game.board[this.id].forEach(m => m.activate("inspire"));
        this.mana -= this.heroPowerCost;
        this.canUseHeroPower = false;

        game.events.broadcast("HeroPower", this.heroClass, this);
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
        if (this.heroClass != "Death Knight") return false;
        if (this.corpses < amount) return false;

        this.corpses -= amount;
        callback();

        return true;
    }

    /**
     * Returns true if the player has the correct runes
     *
     * @param runes The runes to test against
     *
     * @return Whether or not the player has the correct runes
     */
    testRunes(runes: string): boolean {
        const charCount = (str: string, letter: string) => {
            let letter_count = 0;

            for (let i = 0; i < str.length; i++) {
                if (str.charAt(i) == letter) letter_count++;
            }

            return letter_count;
        }

        let blood = charCount(runes, "B");
        let frost = charCount(runes, "F");
        let unholy = charCount(runes, "U");

        let b = charCount(this.runes, "B");
        let f = charCount(this.runes, "F");
        let u = charCount(this.runes, "U");

        if (blood > b || frost > f || unholy > u) return false;
        return true;
    }
}
