const { Card } = require("./card");
const { Game } = require("./game");
const { get } = require("./shared");

/**
 * @type {Game}
 */
let game = get();

class Player {
    /**
     * @param {string} name 
     */
    constructor(name) {
        this.getInternalGame();

        this.name = name;
        this.id = null;
        this.ai = null;
        this.game = null;
        this.fatigue = 0;

        /**
         * @type {"Player"}
         */
        this.classType = "Player";

        this.deck = [];
        this.hand = [];

        this.mana = 0;
        this.maxMana = 0;
        this.maxMaxMana = 10;
        this.overload = 0;

        this.health = 30;
        this.maxHealth = this.health;
        this.armor = 0;

        this.hero = "";
        this.heroClass = "Mage";
        this.heroPowerCost = 2;
        this.canUseHeroPower = true;

        this.weapon = null;
        this.frozen = false;
        this.immune = false;
        this.attack = 0;
        this.spellDamage = 0;

        this.counter = [];
        this.secrets = [];
        this.sidequests = [];
        this.quests = [];

        // Stats
        this.jadeCounter = 0;
        this.corpses = 0;

        this.runes = "";

        this.forceTarget = null;
    }

    /**
     * Update the `game` variable.
     */
    getInternalGame() {
        game = get();
    }

    /**
     * Get this player's opponent
     * 
     * @returns {Player} Opponent
     */
    getOpponent() {
        const id = (this.id == 0) ? 2 : 1;

        return game["player" + id];
    }

    // Mana

    /**
     * Adds mana to this player, then checks if the mana is more than `comp`, if it is, set mana to `comp`.
     * 
     * @param {number} mana The mana to add
     * @param {number} [comp] The comperison
     * 
     * @returns {boolean} Success
     */
    refreshMana(mana, comp = this.maxMana) {
        this.mana += mana;

        if (this.mana > comp) this.mana = comp;

        return true;
    }

    /**
     * Increases max mana by `mana`, then if `cap` is true; check if max mana is more than max max mana (10), if it is, set max mana to max max mana
     * 
     * @param {number} mana The mana to add
     * @param {boolean} [cap=false] Should prevent max mana going over max max mana
     * 
     * @returns {boolean} Success 
     */
    gainEmptyMana(mana, cap = false) {
        this.maxMana += mana;

        if (cap && this.maxMana > this.maxMaxMana) this.maxMana = this.maxMaxMana;

        return true;
    }

    /**
     * Increases both mana and max mana by `mana`
     * 
     * @param {number} mana The number to increase mana and max mana by
     * @param {boolean} [cap=false] Should prevent max mana going over max max mana (10)
     * 
     * @returns {boolean} Success
     */
    gainMana(mana, cap = false) {
        this.gainEmptyMana(mana, cap);
        this.refreshMana(mana);

        return true;
    }

    /**
     * Increases the players overload by `overload`
     * 
     * @param {number} overload The amount of overload to add
     * 
     * @returns {boolean} Success
     */
    gainOverload(overload) {
        this.overload += overload;
        const plus = this.maxMana == this.maxMaxMana ? 0 : 1;

        if (this.overload > this.mana + plus) this.overload = this.mana + plus;

        game.events.broadcast("GainOverload", overload, this);

        return true;
    }

    // Weapons

    /**
     * Sets this player's weapon to `weapon`
     * 
     * @param {Card} weapon The weapon to set
     * 
     * @returns {boolean} Success
     */
    setWeapon(weapon) {
        this.destroyWeapon(true);
        this.weapon = weapon;
        this.attack += weapon.getAttack();

        return true;
    }

    /**
     * Destroys this player's weapon
     * 
     * @param {boolean} [triggerDeathrattle=false] Should trigger the weapon's deathrattle
     * 
     * @returns {boolean} Success
     */
    destroyWeapon(triggerDeathrattle = false) {
        if (!this.weapon) return false;

        if (triggerDeathrattle) this.weapon.activate("deathrattle");
        this.attack -= this.weapon.getAttack();
        this.weapon.destroy();
        this.weapon = null;

        return true;
    }

    // Stats

    /**
     * Increases the player's attack by `amount`.
     * 
     * @param {number} amount The amount the player's attack should increase by
     * 
     * @returns {boolean} Success
     */
    addAttack(amount) {
        this.attack += amount;

        game.events.broadcast("GainHeroAttack", amount, this);

        return true;
    }

    /**
     * Increases the player's health by `amount`
     * 
     * @param {number} amount The amount the player's health should increase by
     * 
     * @returns {boolean} Success
     */
    addHealth(amount) {
        this.health += amount;

        if (this.health > this.maxHealth) this.health = this.maxHealth;

        return true;
    }

    /**
     * Decreases the player's health by `amount`. If the player has armor, the armor gets decreased instead.
     * 
     * @param {number} amount The amount the player's health should decrease by
     * @param {boolean} update If this should broadcast the `TakeDamage` event.
     * 
     * @returns {boolean} Success
     */
    remHealth(amount, update = true) {
        if (this.immune) return true;

        let a = amount;

        while (this.armor > 0 && a > 0) {
            a--;
            this.armor--;
        }

        if (a <= 0) return true;

        this.health -= a;

        if (update) game.events.broadcast("TakeDamage", [this, amount], this);

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
     * 
     * @returns {number}
     */
    getHealth() {
        // I have this here for compatibility with minions
        return this.health;
    }

    // Hand / Deck

    /**
     * Shuffle a card into this player's deck
     * 
     * @param {Card} card The card to shuffle
     * @param {boolean} [updateStats=true] Should this broadcast the `AddCardToDeck` event.
     * 
     * @returns {boolean} Success
     */
    shuffleIntoDeck(card, updateStats = true) {
        // Add the card into a random position in the deck
        let pos = game.functions.randInt(0, this.deck.length);
        this.deck.splice(pos, 0, card);

        if (updateStats) {
            game.events.broadcast("AddCardToDeck", card, this);
        }

        this.deck = game.functions.shuffle(this.deck);

        return true;
    }

    /**
     * Adds a card to the bottom of this player's deck
     * 
     * @param {Card} card The card to add to the bottom of the deck
     * @param {boolean} [update=true] Should this broadcast the `AddCardToDeck` event.
     * 
     * @returns {boolean} Success
     */
    addToBottomOfDeck(card, update = true) {
        this.deck = [card, ...this.deck];

        if (update) game.events.broadcast("AddCardToDeck", card, this);

        return true;
    }

    /**
     * Draws the card at the top of this player's deck
     * 
     * @param {boolean} [update=true] Should this broadcast the `DrawCard` event.
     * 
     * @returns {Card | undefined} Card is the card drawn
     */
    drawCard(update = true) {
        if (this.deck.length <= 0) {
            this.fatigue++;

            this.remHealth(this.fatigue);
            
            return;
        }

        let card = this.deck.pop()

        if (update) game.events.broadcast("DrawCard", card, this);

        if (card.type == "Spell" && card.keywords.includes("Cast On Draw") && card.activate("cast")) return this.drawCard();

        this.addToHand(card, false);

        return card;
    }

    /**
     * Draws a specific card from this player's deck
     * 
     * @param {Card} card The card to draw
     * @param {boolean} [update=true] Should this broadcast the `DrawCard` event.
     * 
     * @returns {Card | undefined} Card is the card drawn
     */
    drawSpecific(card, update = true) {
        if (this.deck.length <= 0) return;

        this.deck = this.deck.filter(c => c !== card);

        if (update) game.events.broadcast("DrawCard", card, this);

        if (card.type == "Spell" && card.keywords.includes("Cast On Draw") && card.activate("cast")) return;

        this.addToHand(card, false);

        return card;
    }

    /**
     * Adds a card to the player's hand
     * 
     * @param {Card} card The card to add
     * @param {boolean} [updateStats=true] Should this broadcast the `AddCardToHand` event.
     * 
     * @returns {boolean} Success
     */
    addToHand(card, updateStats = true) {
        if (this.hand.length >= 10) return false;
        this.hand.push(card);

        if (updateStats) game.events.broadcast("AddCardToHand", card, this);
        return true;
    }

    /**
     * Removes a card from the player's hand
     * 
     * @param {Card} card The card to remove
     * 
     * @returns {boolean} Success
     */
    removeFromHand(card) {
        this.hand = this.hand.filter(c => c !== card);
        return true;
    }

    // Hero power / Class

    /**
     * Sets the player's hero to `hero`
     * 
     * @param {Card} hero The hero that the player should be set to
     * @param {number} [armor=5] The amount of armor the player should gain
     * @param {boolean} [setHeroClass=true] Set the players hero class.
     * 
     * @returns {boolean} Success
     */
    setHero(hero, armor = 5, setHeroClass = true) {
        this.hero = hero;
        if (setHeroClass) this.heroClass = hero.class;
        this.heroPowerCost = hero.hpCost || 2;

        this.armor += armor;
        return true;
    }

    /**
     * Sets the player's hero to the default hero of `heroClass`
     *
     * @param {string} [heroClass] The class of the hero. This defaults to the player's class.
     *
     * @returns {boolean} Success
     */
    setToStartingHero(heroClass = this.heroClass) {
        let hero_card = heroClass + " Starting Hero";
        hero_card = game.functions.getCardByName(hero_card);

        if (!hero_card) return false;
        this.setHero(new game.Card(hero_card.name, this), 0, false);

        return true;
    }

    /**
     * Activate the player's hero power.
     * 
     * @returns {boolean | -1} Success | Cancelled
     */
    heroPower() {
        if (this.mana < this.heroPowerCost || !this.canUseHeroPower) return false;
        if (!this.hero) return false;

        if (this.hero.activate("heropower") == -1) return -1;

        game.board[this.id].forEach(m => m.activate("inspire"));
        this.mana -= this.heroPowerCost;
        this.canUseHeroPower = false;

        game.events.broadcast("HeroPower", this.heroClass, this);
        return true;
    }

    // Other

    /**
     * Calls `callback` if the player has `amount` corpses.
     *
     * @param {number} amount The amount of corpses to trade
     * @param {Function} callback The function to call when the trade is successful. No parameters.
     *
     * @returns {boolean} Success
     */
    tradeCorpses(amount, callback) {
        if (this.heroClass != "Death Knight") return false;
        if (this.corpses < amount) return false;

        this.corpses -= amount;
        callback();

        return true;
    }

    /**
     * Returns true if the player has the correct runes
     *
     * @param {string} runes The runes to test against
     *
     * @return {boolean} Whether or not the player has the correct runes
     */
    testRunes(runes) {
        const charCount = (str, letter) => {
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

exports.Player = Player;
