const { get } = require("./shared");

let game = get();

class Card {
    constructor(name, plr) {
        game = get();

        this.blueprint = game.cards.find(c => c.name == name);
        
        this.name = name;
        this.displayName = name;

        this.costType = "mana";

        this.keywords = [];
        this.storage = []; // Allow cards to store data for later use

        this.turn = game.turns; // The turn the card was played
        this.turnKilled = -1;

        this.infuse_num = -1; // The amount of infuse a card has. Set to -1 for no infuse.
        this.frozen_turn = -1;

        this.spellClass = null;

        this.attackTimes = 1; // The number of times a minion can attack, windfury: 2, mega-windfury: 4
        this.stealthDuration = 0; // The amount of turns stealth should last

        this.canAttackHero = true;
        this.sleepy = true;

        // Set these variables to true or false.
        const exists = ["corrupted", "colossal", "dormant", "uncollectible", "frozen", "immune", "echo"];
        exists.forEach(i => {
            this[i] = this.blueprint[i] || false;
        });

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

        // Set maxHealth if the card is a minion or weapon
        if (this.type == "Minion" || this.type == "Weapon") this.maxHealth = this.blueprint.stats[1];

        this.desc = game.functions.parseTags(this.desc);
        this.enchantments = [];

        // Make a backup of "this" to be used when silencing this card
        let backups = {"init": {}};
        Object.entries(this).forEach(i => backups["init"][i[0]] = i[1]);
        this.backups = backups;

        this.plr = plr;

        this.randomizeIds();

        this.placeholder = this.activate("placeholders")[0]; // This is a list of replacements.
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
         * @returns {bool} Success
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
         * @returns {bool} Success
         */

        this.keywords = this.keywords.filter(k => k != keyword);

        return true;
    }
    freeze() {
        /**
         * Freeze the minion
         *
         * @returns {null}
         */
        this.frozen_turn = game.turns;
        this.frozen = true;

        game.events.broadcast("FreezeCard", this, this.plr);
    }
    decAttack() {
        /**
         * Decrement attackTimes and if it is 0, set sleepy to true
         *
         * @returns {null}
         */

        this.attackTimes--;
        if (this.attackTimes <= 0) this.sleepy = true;
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
         * @returns {bool} Success
         */

        let before = this.getHealth();

        this.setStats(this.getAttack(), this.getHealth() + amount, !restore);
    
        if (!restore) {
            this.resetMaxHealth(true);
            return true;
        }

        // Restore health

        if (this.getHealth() > this.maxHealth) {
            // Too much health
            this.activate("overheal"); // Overheal keyword

            if (this.getHealth() > before) game.events.broadcast("HealthRestored", this.maxHealth, this.plr);
            this.stats[1] = this.maxHealth;
        } else if (this.getHealth() > before) {
            game.events.broadcast("HealthRestored", this.getHealth(), this.plr);
        }

        return true;
    }
    addAttack(amount) {
        /**
         * Adds "amount" to the minions attack
         * 
         * @param {number} amount The attack to add
         * 
         * @returns {bool} Success
         */

        this.setStats(this.getAttack() + amount, this.getHealth());

        return true;
    }
    remDur(amount) {
        /**
         * Removes "amount" from the location's durability
         * 
         * @param {number} amount The durability to remove
         * 
         * @returns {boolean} Success
         */

        if (this.type != "Location") return false;

        this.setStats(0, this.getHealth() - amount);
        return true;
    }
    remHealth(amount) {
        /**
         * Removes "amount" from the minions health
         * 
         * @param {number} amount The health to remove
         * 
         * @returns {boolean} Success
         */

        if (this.type == "Location") return false;

        if (this.immune) return true;
        if (this.keywords.includes("Stealth")) return true;

        this.setStats(this.getAttack(), this.getHealth() - amount);
        game.events.broadcast("DamageMinion", [this, amount], this.plr);

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
         * @returns {bool} Success
         */

        this.setStats(this.getAttack() - amount, this.getHealth());

        return true;
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

    createBackup() {
        /**
         * Create a backup of the card
         *
         * @returns {number} The key of the backup. You can use it by doing `card.backups[key]`
         */
        let key = Object.keys(this.backups).length;
        this.backups[key] = {};
        Object.entries(this).forEach(i => this.backups[key][i[0]] = i[1]);
        
        return key;
    }
    restoreBackup(backup) {
        /**
         * Restore a backup of the card
         *
         * @param {Object} backup The backup. It is recommended to supply a backup from `card.backups`.
         *
         * @returns {bool} Success
         */
        Object.keys(backup).forEach(att => {
            this[att] = backup[att];
        });

        return true;
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
            if (this.backups["init"][att]) this[att] = this.backups["init"][att];

            // Check if the attribute if defined in the blueprint. If it is; restore it.
            else if (this.blueprint[att]) this[att] = this.blueprint[att];
        });
        this.desc = "";
        this.keywords = [];

        this.applyEnchantments(); // Remove active enchantments.
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

            // Check if the method is conditioned
            if (this.conditioned && this.conditioned.includes(name) && this.activate("condition")[0] === false) return;

            let r = i(this.plr, game, this, ...args);
            ret.push(r);

            if (r != -1 || name == "deathrattle") return;

            // If the return value is -1, meaning "refund", refund the card and stop the for loop
            game.events.broadcast("CancelCard", [this, name], this.plr);

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
    clearCondition() {
        /**
         * Add ` (Condition cleared)` to the description of the card.
         *
         * @returns {null}
         */
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
    getEnchantmentInfo(e) {
        /**
         * Get information from an enchantment. Example: "mana = 1" returns {"key": "mana", "val": "1", "op": "="}
         *
         * @param {str} e The enchantment string
         *
         * @returns {Object<key, val, op>} The info
         */
        let equalsRegex = /\w+ = \w+/;
        let otherRegex = /[-+*/^]\d+ \w+/;

        let opEquals = equalsRegex.test(e);
        let opOther = otherRegex.test(e);

        let key;
        let val;
        let op = "=";

        if (opEquals) [key, val] = e.split(" = ");
        else if (opOther) {
            [val, key] = e.split(" ");
            val = val.slice(1);

            op = e[0];
        }

        return {"key": key, "val": val, "op": op};
    }
    applyEnchantments() {
        /**
         * Runs through the enchantments list and applies each enchantment in order.
         *
         * @returns {bool} Success
         */
        // Apply baseline for int values.
        const whitelisted_vars = ["maxHealth", "mana"];

        let vars = Object.entries(this);
        vars = vars.filter(c => typeof(c[1]) == "number"); // Filter for only numbers
        vars = vars.filter(c => whitelisted_vars.includes(c[0])); // Filter for vars in the whitelist

        // Get keys
        let keys = [];

        let enchantments = this.enchantments.map(e => e[0]); // Get a list of enchantments
        enchantments.forEach(e => {
            let info = this.getEnchantmentInfo(e);
            let key = info.key;
            
            keys.push(key);
        });

        vars = vars.filter(c => keys.includes(c[0])); // Only reset the variables if the variable name is in the enchantments list
        vars.forEach(ent => {
            let [key, val] = ent;

            // Apply backup if it exists, otherwise keep it the same.
            if (this.backups["init"][key] || this.backups["init"][key] === 0) this[key] = this.backups["init"][key];
        });

        this.enchantments.forEach(e => {
            e = e[0];

            // Seperate the keys and values
            let info = this.getEnchantmentInfo(e);
            let [key, val, op] = Object.values(info);
            
            if (op == "=") op = ""; // Otherwise `this[key] == val` happens

            val = parseInt(val);

            // Totally safe piece of code :)
            eval(`this[key] ${op}= val`);
        });

        return true;
    }
    addEnchantment(e, card) {
        /**
         * Add an enchantment to the card. The enchantments look something like this: "mana = 1", "+1 mana", "-1 mana"
         *
         * @param {str} e The enchantment string
         * @param {Card} card The creator of the enchantment. If another card gives this card an enchantment then this paramater needs to be the card that gave this card the enchantment. This will allow that card to remove the enchantment or look for the enchantment later.
         *
         * @returns {bool} Success
         */
        // DO NOT PASS USER INPUT DIRECTLY INTO THIS FUNCTION. IT CAN ALLOW FOR EASY CODE INJECTION
        let info = this.getEnchantmentInfo(e);

        if (info.op == "=") this.enchantments.unshift([e, card]); // Add the enchantment to the beginning of the list
        else this.enchantments.push([e, card]);

        this.applyEnchantments();

        return true;
    }
    enchantmentExists(e, card) {
        /**
         * Checks if an enchantment exists.
         *
         * @param {str} e The enchantment to look for.
         * @param {Card} card The owner of the enchantment. Look at `addEnchantment` for more info. This needs to be correct to find the right enchantment
         *
         * @returns {bool} If the enchantment exists
         */
        return this.enchantments.find(c => c[0] == e && c[1] == card);
    }
    removeEnchantment(e, card, update = true) {
        /**
         * Removes an enchantment
         *
         * @param {str} e The enchantment to remove
         * @param {Card} card The owner of the enchantment. Look at `enchantmentExists` for more info.
         * @param {bool} update [default=true] Keep this enabled unless you know what you're doing.
         *
         * @returns {bool} Success
         */
        let enchantment = this.enchantments.find(c => c[0] == e && c[1] == card);
        let index = this.enchantments.indexOf(enchantment);
        if (index === -1) return false;

        this.enchantments.splice(index, 1);

        if (!update) {
            this.applyEnchantments();
            return true;
        }

        // Update is enabled
        let info = this.getEnchantmentInfo(e);
        let new_enchantment = `+0 ${info.key}`;

        this.addEnchantment(new_enchantment, this); // This will cause the variable to be reset since it is in the enchantments list.
        this.removeEnchantment(new_enchantment, this, false);

        return true;
    }

    replacePlaceholders() {
        /**
         * Replaces the placeholders ('{0}') with its value
         * 
         * @returns {undefined}
         */

        if (!this.placeholder) return;

        this.placeholder = this.activate("placeholders")[0];

        Object.entries(this.placeholder).forEach(p => {
            let [key, val] = p;

            let replacement = `{ph:${key}} ${val} {/ph}`;

            this.desc = this.desc.replace(new RegExp(`{ph:${key}} .*? {/ph}`, 'g'), replacement);
            this.desc = this.desc.replaceAll(`{${key}}`, replacement);
        });
    }

    perfectCopy() {
        /**
         * Return a perfect copy of this card. This will perfectly clone the card. This happens when, for example, a card gets temporarily removed from the board using card.destroy, then put back on the board.
         *
         * @returns {Card} A perfect copy of this card.
         */

        return game.functions.cloneCard(this);
    }
    imperfectCopy() {
        /**
         * Return an imperfect copy of this card. This happens when, for example, a card gets shuffled into your deck in vanilla Hearthstone.
         */

        return new Card(this.name, this.plr);
    }
}

exports.Card = Card;
