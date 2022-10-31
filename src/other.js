const { setup_card } = require("./card");

let cards = {};
let game = null;

class Player {
    constructor(name) {
        this.name = name;
        this.id = null;
        this.deck = [];
        this.hand = [];
        this.mana = 0;
        this.maxMana = 0;
        this.maxMaxMana = 10;
        this.game = null;
        this.health = 30;
        this.maxHealth = this.health;
        this.attack = 0;
        this.armor = 0;
        this.class = "Mage";
        this.hero_power = this.class;
        this.hero = "";
        this.heroPowerCost = 2;
        this.canUseHeroPower = true;
        this.weapon = null;
        this.fatigue = 0;
        this.frozen = false;
        this.immune = false;
        this.overload = 0;
        this.spellDamage = 0;
        this.counter = [];
        this.secrets = [];
        this.sidequests = [];
        this.quests = [];
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
    gainMana(mana) {
        /**
         * Increases both mana and max mana by "mana"
         * 
         * @param {number} mana The number to increase mana and max mana by
         * 
         * @returns {undefined}
         */

        this.gainEmptyMana(mana);
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

        game.stats.update("overloadGained", overload);
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

        game.stats.update("heroAttackGained", amount);
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
    remHealth(amount) {
        /**
         * Decreases the player's health by "amount". If the player has armor, the armor gets decreased instead.
         * 
         * @param {number} amount The amount the player's health should increase by
         * 
         * @returns {boolean} Success
         */

        var a = amount;

        while (this.armor > 0 && a > 0) {
            a--;
            this.armor--;
        }

        if (a <= 0) return true;

        this.health -= a;

        if (game.player == this) {
            game.stats.update("damageTakenOnOwnTurn", amount);
        }

        if (this.health <= 0) {
            this.game.stats.update("fatalDamageTimes", 1);

            if (this.health <= 0) { // This is done to allow secrets to prevent death
                this.game.endGame(game.opponent);
            }
        }

        return true;
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
        var pos = this.game.functions.randInt(0, this.deck.length);
        this.deck.splice(pos, 0, card);

        if (updateStats) {
            this.game.stats.update("cardsAddedToDeck", card);
        }
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

        this.game.stats.update("cardsAddedToDeck", card);
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

        if (card.type == "Spell" && card.activate("castondraw")) return null;

        this.addToHand(card, false);

        if (update) {
            game.stats.update("cardsDrawn", card);
            game.stats.update("cardsDrawnThisTurn", card);
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
            game.stats.update("cardsDrawn", card);
            game.stats.update("cardsDrawnThisTurn", card);
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

        if (this.hand.length < 10) {
            this.hand.push(card);
        
            if (updateStats) game.stats.update("cardsAddedToHand", card);
        }
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
    setClass(_class, hp = true) {
        /**
         * Sets the player's class to "_class"
         * 
         * @param {string} _class The class that the player should be set to
         * @param {boolean} hp [default=true] Should the hero power be changed to that class's default hero power
         * 
         * @returns {undefined}
         */

        this.class = _class;
        if (hp) this.hero_power = _class;
    }
    setHero(hero, armor = 5) {
        /**
         * Sets the player's hero to "hero"
         * 
         * @param {Card} hero The hero that the player should be set to
         * @param {number} armor [default=5] The amount of armor the player should gain
         * 
         * @returns {undefined}
         */

        this.hero = hero;

        this.hero_power = "hero";
        this.class = hero.class;

        this.armor += armor;
    }
    heroPower() {
        /**
         * Activate the player's hero power.
         * 
         * @returns {number | boolean} -1 | Success
         */

        if (this.hero_power == "Demon Hunter") this.heroPowerCost = 1;
        else this.heroPowerCost = 2; // This is to prevent changing hero power to demon hunter and changing back to decrease cost to 1

        if (this.mana < this.heroPowerCost || !this.canUseHeroPower) return false;

        if (this.hero && this.hero_power == "hero") {
            if (this.hero.activate("heropower") != -1) {
                this.game.board[this.id].forEach(m => {
                    m.activate("inspire");
                });

                this.mana = this.mana - this.heroPowerCost;

                game.stats.update("heroPowers", this.hero_power);

                this.canUseHeroPower = false;

                return -1;
            }

            return true;
        }

        if (this.hero_power == "Demon Hunter") {
            this.addAttack(1);
        }
        else if (this.hero_power == "Druid") {
            this.addAttack(1);
            this.armor += 1;
        }
        else if (this.hero_power == "Hunter") {
            this.game.opponent.remHealth(2);
        }
        else if (this.hero_power == "Mage") {
            // dontupdate means prevent selectting an elusive target, but don't update
            // game.stats.spellsCastOnMinions
            // dontupdate can really be any value as long as it is not true or false
            var t = this.game.functions.selectTarget("Deal 1 damage.", "dontupdate");

            if (!t) return false;

            if (t instanceof Player) {
                t.remHealth(1);
            } else {
                game.functions.attackMinion(1, t);
            }
        }
        else if (this.hero_power == "Paladin") {
            game.summonMinion(new game.Card("Silver Hand Recruit", this), this);
        }
        else if (this.hero_power == "Priest") {
            var t = this.game.functions.selectTarget("Restore 2 health.", "dontupdate");

            if (!t) return false;

            t.addHealth(2, true);
        }
        else if (this.hero_power == "Rogue") {
            this.weapon = new game.Card("Wicked Knife", this);
        }
        else if (this.hero_power == "Shaman") {
            const totem_cards = ["Healing Totem", "Searing Totem", "Stoneclaw Totem", "Strength Totem"];

            game.board[this.id].forEach(m => {
                if (totem_cards.includes(m.displayName)) {
                    totem_cards.splice(totem_cards.indexOf(m.displayName), 1);
                }
            });

            if (totem_cards.length == 0) {
                return;
            }

            game.summonMinion(new game.Card(game.functions.randList(totem_cards), this), this);
        }
        else if (this.hero_power == "Warlock") {
            this.remHealth(2);

            this.drawCard();
        }
        else if (this.hero_power == "Warrior") {
            this.armor += 2;
        }

        this.game.board[this.id].forEach(m => {
            m.activate("inspire");
        });

        this.mana -= this.heroPowerCost;

        game.stats.update("heroPowers", this.hero_power);

        this.canUseHeroPower = false;

    }
}

class Constants {
    constructor(_game, debug, maxDeckLength, maxBoardSpace) {
        game = _game;
        this.debug = debug;
        this.maxDeckLength = maxDeckLength;
        this.maxBoardSpace = maxBoardSpace;
    }
}

class Functions {
    // QoL
    // https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj - Vladyslav
    shuffle(array) {
        /**
         * Shuffle the array and return the result
         * 
         * @param {any[]} array Array to shuffle
         * 
         * @returns {any[]} Shuffeled array
         */

        const newArray = [...array]
        const length = newArray.length

        for (let start = 0; start < length; start++) {
            const randomPosition = this.randInt(0, (newArray.length - start) - 1);
            const randomItem = newArray.splice(randomPosition, 1)

            newArray.push(...randomItem)
        }

        return newArray
    }
    randList(list) {
        /**
         * Return a random element from "list"
         * 
         * @param {any[]} list
         * 
         * @returns {any} Item
         */

        let item = list[this.randInt(0, list.length - 1)];
        
        if (item instanceof game.Card) item = new game.Card(item.name);

        return item;
    }
    randInt(min, max) {
        /**
         * Return a random number from "min" to "max"
         * 
         * @param {number} min The minimum number
         * @param {number} max The maximum number
         * 
         * @returns {number} The random number
         */

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    capitalize(str) {
        /**
         * Capitilizes and returns the string
         * 
         * @param {string} str String
         * 
         * @return {string} The string capitilized
         */

        return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }

    // Getting card info
    getType(card) {
        /**
         * Returns the type of a card
         * 
         * @param {Card | Blueprint} card The card to check
         * 
         * @returns {string} The type of the card
         */

        if (card.cooldown) return "Location";
        
        else if (card.tribe) return "Minion"; // If you see this in the error log, the error occorred since the game failed to get the type of a minion. Error Code: #21
        else if (card.stats) return "Weapon";
        else if (card.heropower) return "Hero";
        else return "Spell";
    }
    getCardByName(name) {
        /**
         * Gets the card that has the same name as "name"
         * 
         * @param {string} name The name
         * 
         * @returns {Blueprint} The blueprint of the card
         */

        return Object.values(game.cards).find(c => c.name.toLowerCase() == name.toLowerCase());
    }
    cloneObject(object) {
        /**
         * Clones the "object" and returns the clone
         * 
         * @param {object} object The object to clone
         * 
         * @returns {object} Clone
         */

        return Object.assign(Object.create(Object.getPrototypeOf(object)), object);
    }
    cloneCard(card, plr) {
        /**
         * Clones a card, assigns it the to "plr", sets some essential properties
         * 
         * @param {Card} card The card to clone
         * @param {Player} plr The owner of the card
         * 
         * @returns {Card} Clone
         */

        let clone = this.cloneObject(card);

        clone.randomizeIds();
        clone.sleepy = true;
        clone.plr = plr;
        clone.turn = game.turns;

        return clone;
    }

    // Damage
    attackMinion(attacker, target) {
        /**
         * Makes a minion or hero attack another minion or hero
         * 
         * @param {Card | Player} attacker The attacker
         * @param {Card | Player} target The target
         * 
         * @returns {boolean} Success
         */

        game.killMinions();

        // The first variable is a number
        if (!isNaN(attacker)) {
            if (target.keywords.includes("Divine Shield")) {
                target.removeKeyword("Divine Shield");
                return false;
            }

            target.remStats(0, attacker)
            if (target.getHealth() > 0 && target.activate("frenzy") !== -1) target.setFunction("frenzy", () => {}, false);

            return true;
        }

        // The first variable is a minion
        attacker.attackTimes--;

        game.stats.update("enemyAttacks", [attacker, target]);
        game.stats.update("minionsThatAttacked", [attacker, target]);
        game.stats.update("minionsAttacked", [attacker, target]);

        let dmgTarget = true;
        let dmgMinion = true;

        if (attacker.immune) dmgMinion = false;

        if (dmgMinion && attacker.keywords.includes("Divine Shield")) {
            attacker.removeKeyword("Divine Shield");
            dmgMinion = false;
        }

        if (dmgMinion) attacker.remStats(0, target.getAttack());

        if (dmgMinion && attacker.getHealth() > 0 && attacker.activate("frenzy") !== -1) target.setFunction("frenzy", () => {}, false);

        if (attacker.keywords.includes("Stealth")) attacker.removeKeyword("Stealth");
    
        attacker.activate("onattack");
        game.stats.update("minionsAttacked", [attacker, target]);
    
        if (dmgMinion && target.keywords.includes("Poisonous")) attacker.setStats(attacker.getAttack(), 0);

        if (target.keywords.includes("Divine Shield")) {
            target.removeKeyword("Divine Shield");
            dmgTarget = false;
        }

        if (dmgTarget && attacker.keywords.includes("Lifesteal")) attacker.plr.addHealth(attacker.getAttack());
        if (dmgTarget && attacker.keywords.includes("Poisonous")) target.setStats(target.getAttack(), 0);

        if (dmgTarget) target.remStats(0, attacker.getAttack())

        if (target.getHealth() > 0 && target.activate("frenzy") !== -1) target.setFunction("frenzy", () => {}, false);
        if (target.getHealth() < 0) attacker.activate("overkill");
        if (target.getHealth() == 0) attacker.activate("honorablekill");

        return true;
    }
    spellDmg(target, damage) {
        /**
         * Deals damage to "target" based on your spell damage
         * 
         * @param {Card | Player} target The target
         * @param {number} damage The damage to deal
         * 
         * @returns {number} The target's new health
         */

        const dmg = this.accountForSpellDmg(damage);

        game.stats.update("spellsThatDealtDamage", [target, dmg]);

        if (target instanceof game.Card) {
            this.attackMinion(dmg, target);
        } else if (target instanceof Player) {
            target.remHealth(dmg);
        }

        return target.getHealth();
    }

    // Account for certain stats
    accountForSpellDmg(damage) {
        /**
         * Returns "damage" + The player's spell damage
         * 
         * @param {number} damage
         * 
         * @returns {number} Damage + spell damage
         */

        return damage + game.player.spellDamage;
    }
    accountForUncollectible(cards) {
        /**
         * Filters out all cards that are uncollectible in a list
         * 
         * @param {Card[] | Blueprint[]} cards The list of cards
         * 
         * @returns {Card[] | Blueprint[]} The cards without the uncollectible cards
         */

        return cards.filter(c => !c.uncollectible);
    }

    // Give user a prompt.
    chooseOne(prompt, options, times = 1) {
        /**
         * Asks the user a "prompt" give the user "options" and do it all "times" times
         * 
         * @param {string} prompt The prompt to ask the user
         * @param {string[]} options The options to give the user
         * @param {number} times [default=1] The amount of time to ask
         * 
         * @returns {string | string[]} The user's answer(s)
         */

        let choices = [];

        for (var i = 0; i < times; i++) {
            var p = `\n${prompt} [`;

            options.forEach((v, i) => {
                p += `${i + 1}: ${v}, `;
            });

            p = p.slice(0, -2);
            p += "] ";

            var choice = game.input(p);

            choices.push(parseInt(choice) - 1);
        }

        if (times === 1) {
            return choices[0];
        } else {
            return choices;
        }
    }
    discover(prompt, amount = 3, flags = [], add_to_hand = true, _cards = []) {
        /**
         * Asks the user a "prompt", show them "amount" cards based on "flags", if "add_to_hand", add the card chosen to the player's hand, else return the card chosen
         * 
         * @param {string} prompt The prompt to ask
         * @param {number} amount [default=3] The amount of cards to show
         * @param {string[]} flags [default=[]] Some flags to filter the cards shown, possible flags: ["Minion", "Spell", "Weapon"]
         * @param {boolean} add_to_hand [default=true] If it should add the card chosen to the current player's hand
         * @param {Card[]} _cards [default=[]] Do not use this variable, keep it at default
         * 
         * @returns {Card | Blueprint} Card if add_to_hand is true, Blueprint if add_to_hand is false.
         */

        let values = _cards;

        if (_cards.length == 0) {
            let possible_cards = [];

            Object.entries(cards).forEach((c, _) => {
                c = c[1];
                let type = this.getType(c);

                if (type == "Spell" && c.class == "Neutral") {}
                else if (c.class === game.player.class || c.class == "Neutral") {
                    if (flags.includes("Minion") && type !== "Minion") return;
                    if (flags.includes("Spell") && type !== "Spell") return;
                    if (flags.includes("Weapon") && type !== "Weapon") return;

                    possible_cards.push(c);
                }
            });

            possible_cards = this.accountForUncollectible(possible_cards);

            if (possible_cards.length == 0) return;

            for (var i = 0; i < amount; i++) {
                var c = game.functions.randList(possible_cards);

                values.push(c);
                possible_cards.splice(possible_cards.indexOf(c), 1);
            }
        }

        var p = `\n${prompt}\n[\n`;

        if (values.length <= 0) return;

        values.forEach((v, i) => {
            let stats = this.getType(v) == "Minion" ? ` [${v.getAttack()} / ${v.getHealth()}]` : "";
            let desc = `(${v.desc})` || "";

            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: {${v.mana}} ${v.displayName || v.name}${stats} ${desc} (${this.getType(v)}),\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        var choice = game.input(p);

        if (!values[parseInt(choice) - 1]) {
            return this.discover(prompt, amount, flags, add_to_hand, values);
        }

        var card = values[parseInt(choice) - 1];

        if (add_to_hand) {
            var c = new game.Card(card.name, game.player);

            game.player.addToHand(c);

            return c;
        } else {
            return card;
        }
    }
    selectTarget(prompt, elusive = false, force_side = null, force_class = null, flags = []) {
        /**
         * Asks the user a "prompt", the user can then select a minion or hero
         * 
         * @param {string} prompt The prompt to ask
         * @param {boolean | string} elusive [default=false] Wether or not to prevent selecting elusive minions, if this is a string, allow selecting elusive minions but don't trigger secrets / quests
         * @param {string | null} force_side [default=null] Force the user to only be able to select minions / the hero of a specific side: ["enemy", "self"]
         * @param {string | null} force_class [default=null] Force the user to only be able to select a minion or a hero: ["hero", "minion"]
         * @param {string[]} flags [default=[]] Change small behaviours ["allow_locations" => Allow selecting location, ]
         * 
         * @returns {Card | Player} The card or hero chosen
         */


        // force_class = [null, "hero", "minion"]
        // force_side = [null, "enemy", "self"]

        if (force_class == "hero") {
            const target = game.input(`Do you want to select the enemy hero, or your own hero? (y: enemy, n: self) `);
    
            return (target.startsWith("y")) ? game.opponent : game.player;
        }

        let p = `\n${prompt} (`;
        if (force_class == null) p += "type 'face' to select a hero | ";
        p += "type 'back' to go back) ";

        const target = game.input(p);

        if (target.startsWith("b")) {
            const return_question = game.input(`WARNING: Going back might cause unexpected things to happen. Do you still want to go back? (y / n) `);
            
            if (return_question.startsWith("y")) return false;
        }

        const board_next = game.board[game.opponent.id];
        const board_self = game.board[game.player.id];

        const board_next_target = board_next[parseInt(target) - 1];
        const board_self_target = board_self[parseInt(target) - 1];

        let minion = undefined;

        if (!target.startsWith("face") && !board_self_target && !board_next_target) {
            // target != "face" and target is not a minion.
            // The input is invalid

            return this.selectTarget(prompt, elusive, force_side, force_class);
        }

        if (force_side) {
            if (target.startsWith("face") && force_class != "minion") {
                if (force_side == "enemy") return game.opponent;

                return game.player;
            }

            minion = (force_side == "enemy") ? board_next_target : board_self_target;
        } else {
            if (target.startsWith("face") && force_class != "minion") return this.selectTarget(prompt, false, null, "hero");
            
            if (board_next.length >= parseInt(target) && board_self.length >= parseInt(target)) {
                // Both players have a minion with the same index.
                // Ask them which minion to select
                var target2 = game.input(`Do you want to select your opponent's (${board_next_target.displayName}) or your own (${board_self_target.displayName})? (y: opponent, n: self | type 'back' to go back) `);
            
                if (target2.startsWith("b")) {
                    // Go back.
                    return this.selectTarget(prompt, elusive, force_side, force_class);
                }

                minion = (target2.startsWith("y")) ? board_next_target : board_self_target;
            } else {
                minion = board_next.length >= parseInt(target) ? board_next_target : board_self_target;
            }
        }

        if (minion === undefined) {
            game.input("Invalid minion.\n");
            return false;
        }

        if (minion.keywords.includes("Elusive") && elusive) {
            game.input("Can't be targeted by Spells or Hero Powers.\n");
            
            // elusive can be set to any value other than true to prevent targetting but not update
            // spells cast on minions
            if (elusive === true) {
                game.stats.update("spellsCastOnMinions", m);
            }
            return false;
        }

        if (minion.keywords.includes("Stealth") && game.player != minion.plr) {
            game.input("This minion has stealth.\n");

            return false;
        }

        // Location
        if (minion.type == "Location") {
            // Set the "allow_locations" flag to allow targetting locations.
            if (!flags.includes("allow_locations")) {
                game.input("You cannot target location cards.\n");

                return false;
            }
        }

        return minion;
    }

    // Keyword stuff
    dredge(prompt = "Choose One:") {
        /**
         * Asks the user a "prompt" and show 3 cards from their deck for the player to choose, the chosen card will be added to the top of their deck
         * 
         * @param {string} prompt [default="Choose One:"] The prompt to ask the user
         * 
         * @returns {Card} The card chosen
         */

        // Look at the bottom three cards of the deck and put one on the top.
        var cards = game.player.deck.slice(0, 3);

        var p = `\n${prompt}\n[`;

        if (cards.length <= 0) return;

        cards.forEach((c, i) => {
            p += `${i + 1}: ${c.displayName}, `;
        });

        p = p.slice(0, -2);

        p += "] ";

        var choice = game.input(p);

        if (!cards[parseInt(choice) - 1]) {
            game.interact.printAll(game.player);

            return this.dredge(prompt);
        }

        var card = cards[parseInt(choice) - 1];

        game.player.shuffleIntoDeck(card);
        game.player.deck.splice(game.player.deck.indexOf(card), 1);

        return card;
    }
    adapt(minion, prompt = "Choose One:") {
        /**
         * Asks the user a "prompt" and show 3 choices for the player to choose, and do something to the minion based on the choice
         * 
         * @param {Card} minion The minion to adapt
         * @param {string} prompt [default="Choose One:"] The prompt to ask the user
         * 
         * @returns {string} The name of the adapt chosen. See the first values of possible_cards
         */

        var possible_cards = [
            ["Crackling Shield", "Divine Shield"],
            ["Flaming Claws", "+3 Attack"],
            ["Living Spores", "Deathrattle: Summon two 1/1 Plants."],
            ["Lightning Speed", "Windfury"],
            ["Liquid Membrane", "Can't be targeted by spells or Hero Powers."],
            ["Massive", "Taunt"],
            ["Volcanic Might", "+1/+1"],
            ["Rocky Carapace", "+3 Health"],
            ["Shrouding Mist", "Stealth until your next turn."],
            ["Poison Spit", "Poisonous"]
        ];
        var values = [];

        for (var i = 0; i < 3; i++) {
            var c = game.functions.randList(possible_cards);

            values.push(c);
            possible_cards.splice(possible_cards.indexOf(c), 1);
        }

        var p = `\n${prompt}\n[\n`;

        values.forEach((v, i) => {
            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: ${v[0]}; ${v[1]},\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        let choice = game.input(p);
        choice = values[parseInt(choice) - 1][0];

        switch (choice) {
            case "Crackling Shield":
                minion.addKeyword("Divine Shield");

                break;
            case "Flaming Claws":
                minion.addStats(3, 0);

                break;
            case "Living Spores":
                minion.addDeathrattle((plr, game) => {
                    game.summonMinion(new game.Card("Plant"), plr);
                    game.summonMinion(new game.Card("Plant"), plr);
                });

                break;
            case "Lightning Speed":
                minion.addKeyword("Windfury");

                break;
            case "Liquid Membrane":
                minion.addKeyword("Elusive");

                break;
            case "Massive":
                minion.addKeyword("Taunt");

                break;
            case "Volcanic Might":
                minion.addStats(1, 1);

                break;
            case "Rocky Carapace":
                minion.addStats(0, 3);

                break;
            case "Shrouding Mist":
                minion.addKeyword("Stealth");
                minion.setStealthDuration(1);

                break;
            case "Poison Spit":
                minion.addKeyword("Poisonous");

                break;
            default:
                break;
        }

        return choice;
    }
    invoke(plr) {
        /**
         * Call invoke on the player
         * 
         * @param {Player} plr The player
         * 
         * @returns {undefined}
         */

        // Filter all cards in "plr"'s deck with a name that starts with "Galakrond, the "
        
        // --- REMOVE FOR DEBUGGING ---
        var cards = plr.deck.filter(c => c.displayName.startsWith("Galakrond, the "));
        if (cards.length <= 0) return;
        // ----------------------------

        switch (plr.class) {
            case "Priest":
                // Add a random Priest minion to your hand.
                var possible_cards = cards.filter(c => this.getType(c) == "Minion" && c.class == "Priest");
                if (possible_cards.length <= 0) return;

                var card = game.functions.randList(possible_cards);
                plr.addToHand(card);

                break;
            case "Rogue":
                // Add a Lackey to your hand.
                const lackey_cards = ["Ethereal Lackey", "Faceless Lackey", "Goblin Lackey", "Kobold Lackey", "Witchy Lackey"];

                plr.addToHand(new game.Card(game.functions.randList(lackey_cards)));

                break;
            case "Shaman":
                // Summon a 2/1 Elemental with Rush.
                game.summonMinion(new game.Card("Windswept Elemental", plr), plr);

                break;
            case "Warlock":
                // Summon two 1/1 Imps.
                game.summonMinion(new game.Card("Draconic Imp", plr), plr);
                game.summonMinion(new game.Card("Draconic Imp", plr), plr);

                break;
            case "Warrior":
                // Give your hero +3 Attack this turn.                
                plr.addAttack(3);

                break;
            default:
                break;
        }
    }
    recruit(plr = game.player, amount = 1, mana_range = [0, 10]) {
        /**
         * Put's a minion within "mana_range" from the plr's deck, into the board
         * 
         * @param {Player} plr [default=current player] The player
         * @param {number} amount [default=1] The amount of minions to recruit
         * @param {number[]} mana_range [default=[0, 10]] The minion recruited's mana has to be more than mana_range[0] and less than mana_range[1]
         * 
         * @returns {Card[]} Returns the cards recruited
         */

        let array = this.shuffle(plr.deck)

        let times = 0;

        let cards = [];

        array.forEach(c => {
            if (c.type == "Minion" && c.mana >= mana_range[0] && c.mana <= mana_range[1] && times < amount) {
                game.summonMinion(new game.Card(c.name, plr), plr);

                times++;
                cards.push(c);
            }
        });

        return cards;
    }

    createJade(plr) {
        /**
         * Creates and returns a jade golem with the correct stats and cost for the player
         * 
         * @param {Player} plr The jade golem's owner
         * 
         * @returns {Card} The jade golem
         */

        if (game.stats.jadeCounter < 30) game.stats.jadeCounter += 1;
        const count = game.stats.jadeCounter;
        const mana = (count < 10) ? count : 10;

        let jade = new game.Card("Jade Golem", plr);
        jade.setStats(count, count);
        jade.mana = mana;

        return jade;
    }
    importCards(path) {
        /**
         * Imports all cards from a folder and returns the cards
         * 
         * @param {string} path The path
         * 
         * @returns {Blueprint[]} The cards
         */

        require("fs").readdirSync(path, { withFileTypes: true }).forEach(file => {
            let p = `${path}\\${file.name}`;
    
            if (file.name == "zzzzzz.js") {
                game.set("cards", cards);
                setup_card(game, cards);
            }

            else if (file.name.endsWith(".js")) {
                let f = require(p);
                cards[f.name] = f;
            }
            else if (file.isDirectory()) this.importCards(p);
        });

        return cards;
    }

    // Quest
    progressQuest(name, value = 1) {
        /**
         * Progress a quest by a value
         * 
         * @param {string} name The name of the quest
         * @param {number} value [default=1] The amount to progress the quest by
         * 
         * @returns {number} The new progress
         */

        let quest = game.player.secrets.find(s => s["name"] == name);
        if (!quest) quest = game.player.sidequests.find(s => s["name"] == name);
        if (!quest) quest = game.player.quests.find(s => s["name"] == name);

        quest["progress"][0] += value;

        return quest["progress"][0];
    }
    addQuest(type, plr, card, key, val, callback, next = null, manual_progression = false) {
        /**
         * Adds a quest / secrets to a player
         * 
         * @param {string} type The type of the quest: ["Quest", "Sidequest", "Secret"]
         * @param {Player} plr The player to add the quest to
         * @param {Card} card The quest / secret
         * @param {string} key The key of the quest
         * @param {any} val The value that the quest needs
         * @param {Function} callback The function to call when the key is invoked, arguments: {any[]} trigger [key, val] The trigger, {Game} game The game, {turn} The turn the quest was played, {boolean} normal_done If the game claims the quest is done
         * @param {string} next [default=null] The name of the next quest / sidequest / secret that should be added when the quest is done
         * @param {boolean} manual_progression [default=false] If the quest needs progressQuest function to be called to progress, or if it should do it automatically
         * 
         * @returns {undefined}
         */

        const t = plr[type.toLowerCase() + "s"];

        if ( (type.toLowerCase() == "quest" && t.length > 0) || ((type.toLowerCase() == "secret" || type.toLowerCase() == "sidequest") && (t.length >= 3 || t.filter(s => s.displayName == card.displayName).length > 0)) ) {
            plr.addToHand(card);
            plr.mana += card.mana;
            
            return false;
        }

        plr[type.toLowerCase() + "s"].push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "next": next, "manual_progression": manual_progression});
    }
}

exports.Functions = Functions;
exports.Player = Player;
exports.Constants = Constants;