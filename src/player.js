let game = null;

function setup(_game) {
    game = _game;
}

class Player {
    constructor(name) {
        this.name = name;
        this.id = null;
        this.ai = null;
        this.game = null;
        this.fatigue = 0;

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

    getOpponent() {
        /**
         * Get this player's opponent
         * 
         * @returns {Player} Opponent
         */

        const id = (this.id == 0) ? 2 : 1;

        return game["player" + id];
    }

    // Mana
    refreshMana(mana, comp = this.maxMana) {
        /**
         * Adds "mana" to this.mana, then checks if this.mana is more than "comp", if it is, set this.mana to "comp"
         * 
         * @param {number} mana The mana to add
         * @param {number} comp [default=Player's max mana] The comperison
         * 
         * @returns {undefined}
         */

        this.mana += mana;

        if (this.mana > comp) this.mana = comp;
    }
    gainEmptyMana(mana, cap = false) {
        /**
         * Increases max mana by "mana", then if cap is true; check if max mana is more than max max mana, if it is, set max mana to max max mana
         * 
         * @param {number} mana The mana to add
         * @param {boolean} cap [default=false] Should prevent max mana going over max max mana
         * 
         * @returns {undefined} 
         */

        this.maxMana += mana;

        if (cap && this.maxMana > this.maxMaxMana) this.maxMana = this.maxMaxMana;
    }
    gainMana(mana, cap = false) {
        /**
         * Increases both mana and max mana by "mana"
         * 
         * @param {number} mana The number to increase mana and max mana by
         * 
         * @returns {undefined}
         */

        this.gainEmptyMana(mana, cap);
        this.refreshMana(mana);
    }
    gainOverload(overload) {
        /**
         * Increases the players overload by "overload"
         * 
         * @param {number} overload The amount of overload to add
         * 
         * @returns {undefined}
         */

        this.overload += overload;

        const plus = this.maxMana == this.maxMaxMana ? 0 : 1;

        if (this.overload > this.mana + plus) this.overload = this.mana + plus;

        game.stats.update("overloadGained", overload, this);
    }

    // Weapons
    setWeapon(weapon) {
        /**
         * Sets this player's weapon to "weapon"
         * 
         * @param {Card} weapon The weapon to set
         * 
         * @returns {undefined}
         */

        this.destroyWeapon(true);
        this.weapon = weapon;
        this.attack += weapon.getAttack();
    }
    destroyWeapon(triggerDeathrattle = false) {
        /**
         * Destroys this player's weapon
         * 
         * @param {boolean} triggerDeathrattle [default=false] Should trigger the weapon's deathrattle
         * 
         * @returns {undefined}
         */

        if (!this.weapon) return false;

        if (triggerDeathrattle) this.weapon.activate("deathrattle");
        this.attack -= this.weapon.getAttack();
        this.weapon.destroy();
        this.weapon = null;
    }

    // Stats
    addAttack(amount) {
        /**
         * Increases the player's attack by "amount"
         * 
         * @param {number} amount The amount the player's attack should increase by
         * 
         * @returns {undefined}
         */

        this.attack += amount;

        game.stats.update("heroAttackGained", amount, this);
    }
    addHealth(amount) {
        /**
         * Increases the player's health by "amount"
         * 
         * @param {number} amount The amount the player's health should increase by
         * 
         * @returns {undefined}
         */

        this.health += amount;

        if (this.health > this.maxHealth) this.health = this.maxHealth;
    }
    remHealth(amount, update = true) {
        /**
         * Decreases the player's health by "amount". If the player has armor, the armor gets decreased instead.
         * 
         * @param {number} amount The amount the player's health should increase by
         * @param {boolean} update If this should be added to the history or stats.
         * 
         * @returns {boolean} Success
         */

        if (this.immune) return true;

        let a = amount;

        while (this.armor > 0 && a > 0) {
            a--;
            this.armor--;
        }

        if (a <= 0) return true;

        this.health -= a;

        if (update) game.stats.update("damageTaken", [this, amount], this);

        if (game.player == this) {
            game.stats.update("damageTakenOnOwnTurn", amount, this);
        }

        if (this.health <= 0) {
            this.game.stats.update("fatalDamageTimes", 1, this);

            if (this.health <= 0) { // This is done to allow secrets to prevent death
                this.game.endGame(this.getOpponent());
            }
        }

        return true;
    }
    getHealth() {
        // I have this here for compatibility with minions
        return this.health;
    }

    // Hand / Deck
    shuffleIntoDeck(card, updateStats = true) {
        /**
         * Shuffle a card into this player's deck
         * 
         * @param {Card} card The card to shuffle
         * @param {boolean} updateStats [default=true] Should this trigger secrets / quests / passives
         * 
         * @returns {undefined}
         */

        // Add the card into a random position in the deck
        let pos = this.game.functions.randInt(0, this.deck.length);
        this.deck.splice(pos, 0, card);

        if (updateStats) {
            this.game.stats.update("cardsAddedToDeck", card, this);
        }

        this.deck = game.functions.shuffle(this.deck);
    }
    addToBottomOfDeck(card) {
        /**
         * Adds a card to the bottom of this player's deck
         * 
         * @param {Card} card The card to add to the bottom of the deck
         * 
         * @returns {undefined}
         */

        this.deck = [card, ...this.deck];

        this.game.stats.update("cardsAddedToDeck", card, this);
    }
    drawCard(update = true) {
        /**
         * Draws the card at the top of this player's deck
         * 
         * @param {boolean} update [default=true] Should this trigger secrets / quests / passives
         * 
         * @returns {undefined | null | Card} Card is the card drawn
         */

        if (this.deck.length <= 0) {
            this.fatigue++;

            this.remHealth(this.fatigue);
            
            return;
        }

        let card = this.deck.pop()

        if (card.type == "Spell" && card.activate("castondraw")) return this.drawCard();

        this.addToHand(card, false);

        if (update) {
            game.stats.update("cardsDrawn", card, this);
            game.stats.update("cardsDrawnThisTurn", card, this);
        }

        return card;
    }
    drawSpecific(card, update = true) {
        /**
         * Draws a specific card from this player's deck
         * 
         * @param {Card} card The card to draw
         * @param {boolean} update [default=true] Should this trigger secrets / quests / passives
         * 
         * @returns {undefined | null | Card} Card is the card drawn
         */

        if (this.deck.length <= 0) return;

        this.deck = this.deck.filter(c => c !== card);

        if (card.type == "Spell" && card.activate("castondraw")) return null;

        this.addToHand(card, false);

        if (update) {
            game.stats.update("cardsDrawn", card, this);
            game.stats.update("cardsDrawnThisTurn", card, this);
        }

        return card;
    }
    addToHand(card, updateStats = true) {
        /**
         * Adds a card to the player's hand
         * 
         * @param {Card} card The card to add
         * @param {boolean} updateStats [default=true] Should this trigger secrets / quests / passives
         * 
         * @returns {undefined}
         */

        if (this.hand.length >= 10) return;
        this.hand.push(card);

        if (updateStats) game.stats.update("cardsAddedToHand", card, this);
    }
    removeFromHand(card) {
        /**
         * Removes a card from the player's hand
         * 
         * @param {Card} card The card to remove
         * 
         * @returns {undefined}
         */

        this.hand = this.hand.filter(c => c !== card);
    }

    // Hero power / Class
    setHero(hero, armor = 5, setHeroClass = true) {
        /**
         * Sets the player's hero to "hero"
         * 
         * @param {Card} hero The hero that the player should be set to
         * @param {number} armor [default=5] The amount of armor the player should gain
         * @param {bool} setHeroClass [default=true] Set the players hero class.
         * 
         * @returns {undefined}
         */

        this.hero = hero;
        if (setHeroClass) this.heroClass = hero.class;
        this.heroPowerCost = hero.hpCost || 2;

        this.armor += armor;
    }
    setToStartingHero(heroClass = this.heroClass) {
        /**
         * Sets the player's hero to the default hero of "heroClass"
         *
         * @param {string} heroClass The class of the hero
         *
         * @returns {bool} Success
         */

        let hero_card = heroClass + " Starting Hero";
        hero_card = game.functions.getCardByName(hero_card);

        if (!hero_card) return false;
        this.setHero(new game.Card(hero_card.name, this), 0, false);

        return true;
    }
    heroPower() {
        /**
         * Activate the player's hero power.
         * 
         * @returns {number | boolean} -1 | Success
         */

        if (this.mana < this.heroPowerCost || !this.canUseHeroPower) return false;
        if (!this.hero) return false;

        if (this.hero.activate("heropower") == -1) return -1;

        this.game.board[this.id].forEach(m => m.activate("inspire"));
        this.mana -= this.heroPowerCost;
        this.canUseHeroPower = false;

        game.stats.update("heroPowers", this.heroClass, this);
        return true;
    }

    // Other
    tradeCorpses(amount, callback) {
        /**
         * Calls "callback" if the player has "amount" corpses
         *
         * @param {number} amount The amount of corpses to trade
         * @param {function} callback The function to call when the trade is successful; Params: None
         *
         * @returns {bool} Success
         */

        if (this.heroClass != "Death Knight") return false;
        if (this.corpses < amount) return false;

        this.corpses -= amount;
        callback();

        return true;
    }
    testRunes(runes) {
        /**
         * Returns true if the player has the correct runes
         *
         * @param {string} runes The runes to test against
         *
         * @return {bool} Wether or not the player has the correct runes
         */

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
exports.setup_player = setup;
