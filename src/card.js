let game = null;
let cards = [];

function setup(_game, _cards) {
    game = _game;
    cards = _cards;
}

class Card {
    constructor(name, plr) {
        this.blueprint = cards[name];
        
        this.name = name;
        this.displayName = name;

        this.type = game.functions.getType(this.blueprint);
        this.costType = "mana";

        this.keywords = [];
        this.storage = []; // Allow cards to store data for later use

        this.turn = game.turns; // The turn the card was played
        this.turnKilled = -1;

        this.infuse_num = -1; // The amount of infuse a card has. Set to -1 for no infuse.

        this.spellClass = null;

        this.attackTimes = 1; // The number of times a minion can attack, windfury: 2, mega-windfury: 4
        this.stealthDuration = 0; // The amount of turns stealth should last

        // Set maxHealth if the card is a minion or weapon
        if (this.type == "Minion" || this.type == "Weapon") this.maxHealth = this.blueprint.stats[1];

        this.canAttackHero = true;
        this.sleepy = true;

        /*
        Go through all blueprint variables and
        set them in the card object
        Example:
        Blueprint: { name: "Sheep", stats: [1, 1], test: true }
                                                   ^^^^^^^^^^
        Do: this.test = true
        
        Function Example:
        Blueprint: { name: "The Coin", mana: 0, cast(plr, game): { plr.gainMana(1) } }
                                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        Do: this.cast = [{ plr.gainMana(1) }]
                        ^                   ^
                            This is in an array so we can add multiple events on casts
        */
        Object.entries(this.blueprint).forEach(i => {
            if (typeof i[1] == "function") this[i[0]] = [i[1]];
            else this[i[0]] = JSON.parse(JSON.stringify(i[1]));
        });

        // Set these variables to true or false.
        const exists = ["corrupted", "colossal", "dormant", "uncollectible", "frozen", "immune", "echo"];
        exists.forEach(i => {
            this[i] = this.blueprint[i] || false;
        });

        this.desc = game.functions.parseTags(this.desc);

        // Make a backup of "this" to be used when silencing this card
        let backups = {};
        Object.entries(this).forEach(i => backups[i[0]] = i[1]);
        this.backups = backups;

        this.plr = plr;

        this.randomizeIds();
    }

    randomizeIds() {
        /**
         * Create random id's for this card to prevent cards from being "linked"
         * 
         * @returns {undefined}
         */

        this.__ids = [];
        for (let i = 0; i < 100; i++) {
            // This is to prevent cards from getting linked. Don't use this variable
            this.__ids.push(game.functions.randInt(0, 671678679546789));
        }
    }
    addDeathrattle(_deathrattle) {
        /**
         * Adds a deathrattle to the card
         * 
         * @param {Function} _deathrattle The deathrattle to add
         * 
         * @returns {undefined}
         */

        if (!this.deathrattle) this.deathrattle = [];

        this.deathrattle.push(_deathrattle);
    }

    // Keywords
    addKeyword(keyword) {
        /**
         * Adds a keyword to the minion
         * 
         * @param {string} keyword The keyword to add
         * 
         * @returns {boolean} Success
         */

        if (this.keywords.includes(keyword)) return false;

        this.keywords.push(keyword);

        if (keyword === "Charge") this.sleepy = false;
        else if (keyword === "Rush") {
            this.sleepy = false;
            this.canAttackHero = false;
        }

        return true;
    }
    removeKeyword(keyword) {
        /**
         * Removes a keyword from the minion
         * 
         * @param {string} keyword The keyword to remove
         * 
         * @returns {undefined}
         */

        this.keywords = this.keywords.filter(k => k != keyword);
    }
    decAttack() {
        /**
         * Decrement attackTimes and if it is 0, set sleepy to true
         *
         * @returns {boolean} If attacktimes is 0
         */

        this.attackTimes--;
        if (this.attackTimes <= 0) this.sleepy = true;

        return this.sleepy;
    }

    // Change stats
    getAttack() {
        return this.stats[0];
    }
    getHealth() {
        return this.stats[1];
    }
    setStats(attack = this.getAttack(), health = this.getHealth(), changeMaxHealth = true) {
        /**
         * Sets the minions attack to "attack" and the minions health to "health"
         * 
         * @param {number} attack [default=this.getAttack()] The attack to set
         * @param {number} health [default=this.getHealth()] The health to set
         * @param {boolean} changeMaxHealth [default=true] Should change maxhealth to health if health is more than maxhealth
         * 
         * @returns {undefined}
         */

        this.stats = [attack, health];

        if (changeMaxHealth && health > this.maxHealth) this.maxHealth = health;
    }
    addStats(attack = 0, health = 0, restore = false) {
        /**
         * Adds "attack" to the minions attack and "health" to the minions health
         * 
         * @param {number} attack [default=0] The attack to add
         * @param {number} health [default=0] The health to add
         * @param {boolean} restore [default=false] Should cap the amount of stats added.
         * 
         * @returns {undefined}
         */

        this.addAttack(attack);
        this.addHealth(health, restore);
    }
    remStats(attack = 0, health = 0) {
        /**
         * Removes "attack" from the minions attack and "health" from the minions health
         * 
         * @param {number} attack [default=0] The attack to remove
         * @param {number} health [default=0] The health to remove
         * 
         * @returns {undefined}
         */

        this.remAttack(attack);
        this.remHealth(health);
    }
    addHealth(amount, restore = true) {
        /**
         * Adds "amount" to the minions health
         * 
         * @param {number} amount The health to add
         * @param {boolean} restore Should reset health to maxHealth if it goes over maxHealth
         * 
         * @returns {undefined}
         */

        let before = this.getHealth();

        this.setStats(this.getAttack(), this.getHealth() + amount, !restore);
    
        if (!restore) return this.resetMaxHealth(true);

        if (this.getHealth() > this.maxHealth) {
            if (this.getHealth() > before) game.stats.update("restoredHealth", this.maxHealth, this.plr);
            this.stats[1] = this.maxHealth;
        } else if (this.getHealth() > before) {
            game.stats.update("restoredHealth", this.getHealth(), this.plr);
        }
    }
    addAttack(amount) {
        /**
         * Adds "amount" to the minions attack
         * 
         * @param {number} amount The attack to add
         * 
         * @returns {undefined}
         */

        this.setStats(this.getAttack() + amount, this.getHealth());
    }
    remHealth(amount) {
        /**
         * Removes "amount" from the minions health
         * 
         * @param {number} amount The health to remove
         * 
         * @returns {boolean} Success
         */

        if (this.immune) return true;

        this.setStats(this.getAttack(), this.getHealth() - amount);
        game.stats.update("minionsDamaged", [this, amount], this.plr);

        if (this.type == "Weapon" && this.getHealth() <= 0) {
            this.plr.destroyWeapon(true);
        }

        return true;
    }
    remAttack(amount) {
        /**
         * Removes "amount" from the minions attack
         * 
         * @param {number} amount The attack to remove
         * 
         * @returns {undefined}
         */

        this.setStats(this.getAttack() - amount, this.getHealth());
    }
    resetMaxHealth(check = false) {
        /**
         * Sets the max health of the minion to it's current health. If check is true it only sets max health if the current health is above it.
         * 
         * @param {boolean} check Prevent lowering maxHealth
         * 
         * @returns {undefined}
         */

        if (check && this.getHealth() <= this.maxHealth) return;

        this.maxHealth = this.getHealth();
    }

    // Set other
    setStealthDuration(duration) {
        /**
         * Sets stealth to only last "duration" amount of turns
         * 
         * @param {number} duration The amount of turns stealth should last
         * 
         * @returns {undefined}
         */

        this.stealthDuration = game.turns + duration;
    }
    resetAttackTimes() {
        /**
         * Sets the attack times of a minion to;
         * 1 if doesn't have windfury,
         * 2 if it does,
         * 4 if it has mega-windfury
         * 
         * @returns {undefined}
         */

        this.attackTimes = 1;

        if (this.keywords.includes("Windfury")) {
            this.attackTimes = 2;
        }
        if (this.keywords.includes("Mega-Windfury")) {
            this.attackTimes = 4;
        }
    }

    // Doom buttons
    kill() {
        /**
         * Kills a minion
         *
         * @returns {undefined}
         */

        this.setStats(this.getAttack(), 0);
        game.killMinions();
    }
    silence() {
        /**
         * Silences the minion
         * 
         * @returns {undefined}
         */

        // Tell the minion to undo it's passive.
        // The false tells the minion that this is the last time it will call unpassive
        // so it should finish whatever it is doing.
        this.activate("unpassive", false);

        Object.keys(this).forEach(att => {
            // Check if a backup exists for the attribute. If it does; restore it.
            if (this.backups[att]) this[att] = this.backups[att];

            // Check if the attribute if defined in the blueprint. If it is; restore it.
            else if (this.blueprint[att]) this[att] = this.blueprint[att];
        });
        this.desc = "";
        this.keywords = [];
    }
    destroy() {
        /**
         * Silences and kills the minion
         * 
         * @returns {undefined}
         */

        this.silence();
        this.kill();
    }

    // Handling functions
    activate(name, ...args) {
        /**
         * Activates a keyword method
         * 
         * @param {string} name The method to activate
         * @param {any} args Pass these args to the method
         * 
         * @returns {any[]} All the return values of the method keywords
         */

        // This activates a function
        // Example: activate("cast")
        // Do: this.cast.forEach(cast_func => cast_func(plr, game, card))
        // Returns a list of the return values from all the function calls

        name = name.toLowerCase();

        // If the card has the function
        if (!this[name]) return false;

        let ret = [];
        
        this[name].forEach(i => {
            if (ret === -1) return;

            let r = i(this.plr, game, this, ...args);
            ret.push(r);

            if (r != -1 || name == "deathrattle") return;

            // If the return value is -1, meaning "refund", refund the card and stop the for loop
            if (["use", "heropower"].includes(name)) {
                ret = -1;
                return;
            }

            this.plr.addToHand(this, false);
            this.plr[this.costType] += this.mana;
            ret = -1;

            // Return from the for loop
            return;
        });

        return ret;
    }
    activateBattlecry(...args) {
        /**
         * Activates a minion's battlecry
         * 
         * @param {...args} args Any arguments to pass to battlecry
         * 
         * @returns {any[]} The return values of all the battlecries triggered
         */

        this.activate("passive", "battlecry", this, game.turns);
        return this.activate("battlecry", ...args);
    }
    passiveCheck(trigger, key, val = null, check_plr = null) {
        /**
         * TODO: Explain this??
         * 
         * @returns {boolean} Success
         */

        let ret;

        if (Array.isArray(key)) ret = !!key.filter(v => v == trigger[0]).length;
        else ret = (trigger[0] == key);

        if (val) {
            if (Array.isArray(val)) ret &&= !!val.filter(v => v == trigger[1]).length;
            else ret &&= (trigger[1] == val);
        }

        if (check_plr) {
            if (typeof trigger[1] == game.Player) ret &&= !!trigger[1].filter(v => v.plr && v.plr == check_plr).length;
            else ret &&= (trigger[1].plr == check_plr);
        }

        return ret;
    }
    clearCondition() {
        this.desc += " (Condition cleared)".gray;
    }
    manathirst(m, t = "", f = "") {
        /**
         * Returns t if "m" is more than or equal to the player's max mana
         *
         * @param {number} m The mana to test
         * @param {any} [default=""] t The value to return if true
         * @param {any} [default=""] f The value to return if false
         * 
         * @returns {any} t | f
         */

        if (this.plr.maxMana < m) {
            if (!f) return false;

            return [false, f];
        }

        if (!t) return true;
        return [true, t];
    }
}

exports.Card = Card;
exports.setup_card = setup;
