//@ts-check
const { Game } = require("./game");
const { Player } = require("./player");
const { get } = require("./shared");

/**
 * @type {Game}
 */
let game = get();

class Card {
    /**
     * Create a card.
     * 
     * @param {string} name The name of the card
     * @param {Player} plr The card's owner.
     */
    constructor(name, plr) {
        game = get();

        /**
         * The card's blueprint.
         * This is the baseline of the card
         * 
         * Properties of this blueprint are set in this class.
         * For example, if the blueprint has a property called "foo", and it is set to 1, then the card will get a property called "foo", with value 1
         * 
         * @type {import("./types").Blueprint}
         */
        this.blueprint = game.cards.find(c => c.name == name);

        /**
         * This is the name of the card, it must be unique.
         * Please do not change this
         * 
         * @type {string}
         */
        this.name = name;

        /**
         * This is used instead of the name when displaying the card, this does not have to be unique.
         * 
         * @type {string}
         */
        this.displayName = name;

        /**
         * The id tied to the blueprint of the card.
         * This differentiates cards from each other, but not cards with the same blueprint.
         * Use uuid for that.
         * 
         * @example
         * let sheep = new Card("Sheep", plr);
         * let another_sheep = new Card("Sheep", plr);
         * 
         * let the_coin = new Card("The Coin", plr);
         * 
         * assert.equal(sheep.id, another_sheep.id);
         * assert.notEqual(sheep.id, the_coin.id);
         * 
         * @type {number | null}
         */
        this.id = null;

        /**
         * The cost of the card.
         * 
         * @type {number}
         */
        this.mana = 0;

        /**
         * The name of this class. This is if you are working with a type that is `Card | Player`.
         * In that case, this is `Card` if that type is `Card`, or `Player` if that type is `Player`.
         * 
         * But for types that are just `Card`, this is the literal string "Card".
         * 
         * @type {"Card"}
         */
        this.classType = "Card";

        /**
         * What currency this card costs.
         * If this is "mana", the card costs `Player.mana`.
         * If this is "armor", the card costs `Player.armor`.
         * If this is "health", the card costs `Player.health`.
         * etc...
         * 
         * This can be any value, as long as it is a defined _number_ in the `Player` class.
         * 
         * @type {"mana" | "armor" | "health"}
         */
        this.costType = "mana";

        /**
         * This is the type of card, e.g. "Spell" or "Minion".
         * 
         * @type {import("./types").CardType}
         */
        this.type = "Undefined";

        /**
         * This is the class that the card belongs to. E.g. "Warlock" or "Mage".
         * 
         * @type {import("./types").CardClass}
         */
        this.class = "Mage";

        /**
         * This is the rarity of the card. E.g. "Free" | "Common" | "Rare" | "Epic" | "Legendary"
         * 
         * @type {import("./types").CardRarity}
         */
        this.rarity = "Free";

        /**
         * If the card is dormant | The turn that the dormant runs out
         * 
         * @type {false | number}
         */
        this.dormant = false;

        /**
         * If the card has been corrupted.
         * 
         * @type {boolean}
         */
        this.corrupted = false;

        /**
         * The _name_ of the corrupted counterpart of this card.
         * 
         * @type {null | string}
         */
        this.corrupt = null;

        /**
         * ["Name of the card above the minion", "", "Name of the card below the minion"]
         * 
         * The "" gets replaced by this minion.
         * This is flexible, you can add as many as you want, in any order. You can even add another "".
         * 
         * @example
         * card = new Card("Sheep", plr);
         * card.colossal = ["Left Arm", "", "Right Arm"];
         * 
         * // Left Arm
         * // Sheep
         * // Right Arm
         * 
         * @type {null | [string]}
         */
        this.colossal = null;

        /**
         * If the card is uncollectible.
         * - Uncollectible cards cannot be added to a deck, and cannot be found in card pools[1].
         * - Uncollectible cards can mostly only be explicitly created by other collectible cards.
         * 
         * [1] Unless explicitly stated otherwise
         * 
         * @type {boolean}
         */
        this.uncollectible = false;

        /**
         * If the card is frozen.
         * A frozen card cannot attack.
         * 
         * @type {boolean}
         */
        this.frozen = false;

        /**
         * If the card is immune.
         * An immune card cannot be targeted at all.
         * 
         * @type {boolean}
         */
        this.immune = false;

        /**
         * If the card is an echo.
         * - Echo cards can be played as many times as the player wants, as long as they have the resources.
         * - Echo cards get removed from the player's hand at the end of the turn.
         * 
         * @type {boolean}
         */
        this.echo = false;

        /**
         * The keywords that the card has. E.g. ["Taunt", "Divine Shield", etc...]
         * 
         * @type {import("./types").CardKeyword[]}
         */
        this.keywords = [];

        /**
         * Information stored in the card.
         * This information can be anything, and the card can access it at any point.
         * 
         * I do not recommend changing this in any other context than in a card's blueprint, unless you know what you are doing.
         * 
         * @type {any[]}
         */
        this.storage = []; // Allow cards to store data for later use

        /**
         * The turn that the card was played / created.
         * 
         * @type {number}
         */
        this.turn = game.turns; // The turn the card was played

        /**
         * The turn that the card was killed.
         * 
         * Set to -1 if the card is not dead.
         * 
         * @type {number}
         */
        this.turnKilled = -1;

        /**
         * The amount of infuse a card has.
         * 
         * Set to -1 if the card does not have infuse.
         * 
         * @type {number}
         */
        this.infuse_num = -1; // The amount of infuse a card has. Set to -1 for no infuse.

        /**
         * The turn that the card was frozen.
         * 
         * Set to -1 if the card is not frozen.
         * 
         * @type {number}
         */
        this.frozen_turn = -1;

        /**
         * If the card is a spell, this is the school of the spell. E.g. "Fire" or "Frost" or "Fel".
         * 
         * @type {import("./types").SpellSchool}
         */
        this.spellClass = "General";

        /**
         * The tribe the card belongs to.
         * 
         * @type {import("./types").MinionTribe}
         */
        this.tribe = "None";

        /**
         * The cooldown of the location card.
         * 
         * @type {number}
         */
        this.cooldown = 0;

        /**
         * The description of the hero power.
         * 
         * @type {string}
         */
        this.hpDesc = "[PLACEHOLDER]";

        /**
         * The cost of the hero power.
         * 
         * @type {number}
         */
        this.hpCost = 2;

        /**
         * The number of times a minion can attack in a turn;
         * - Default: 1
         * - With Windfury: 2
         * - With Mega-Windfury: 4
         * 
         * @type {number}
         */
        this.attackTimes = 1;

        /**
         * The amount of turns stealth should last.
         * 
         * Set to 0 if the card is does not have a stealth duration.
         * 
         * @type {number}
         */
        this.stealthDuration = 0;

        /**
         * If the card can attack the hero.
         * 
         * This will be set to true if the card is a spell and other card types, so verify the type of the card before using this.
         * 
         * @type {boolean}
         */
        this.canAttackHero = true;

        /**
         * If this is true, the card is exhausted and so can't attack this turn.
         * 
         * Automatically gets set to true when the card attacks, and gets set to false at the end of the player's turn.
         * 
         * @type {boolean}
         */
        this.sleepy = true;

        /**
         * Placeholder key-value pairs.
         * 
         * This should not be used directly, unless you know what you are doing.
         * 
         * @example
         * this.placeholder = {
         *     "turn": game.turns,
         * }
         * 
         * assert.equal(this.desc, "The current turn is: {turn}");
         * // Eventually...
         * assert.equal(this.desc, "The current turn is: 1");
         */
        this.placeholder = {};

        /**
         * @type {import("./types").KeywordMethod | false}
         */
        this.spellburst = false;

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

        /**
         * The maximum health of the card.
         * 
         * @type {null | number}
         */
        this.maxHealth = null;

        // Set maxHealth if the card is a minion or weapon
        if (this.type == "Minion" || this.type == "Weapon") this.maxHealth = this.blueprint.stats[1];

        /**
         * The card's description / text.
         * 
         * Might include color tags like `Example [033Example 2[142`.
         * Use `colors.strip()` to remove these.
         * 
         * @type {string}
         */
        this.desc = game.functions.parseTags(this.desc);

        /**
         * The card's enchantments.
         * 
         * @type {[[string, Card]]}
         */
        this.enchantments = [];

        // Make a backup of "this" to be used when silencing this card
        let backups = {"init": {}};
        Object.entries(this).forEach(i => backups["init"][i[0]] = i[1]);

        /**
         * A list of backups of this card.
         * 
         * The card backups don't include the methods so don't call any.
         * 
         * @type {Object<string, Card>}
         */
        this.backups = backups;

        /**
         * The owner of this card.
         * 
         * @type {Player}
         */
        this.plr = plr;

        this.randomizeIds();

        /**
         * The card's uuid. Gets randomly generated when the card gets created.
         * 
         * @type {string}
         */
        this.uuid = this.__ids.map(id => id.toString()[0]).join("");

        /**
         * The list of placeholder ids / replacement strings pairs.
         * 
         * @type {Object.<any, string>}
         */
        this.placeholder = this.activate("placeholders")[0]; // This is a list of replacements.
    }

    /**
     * Create random id's for this card to prevent cards from being "linked"
     * 
     * @returns {boolean} Success
     */
    randomizeIds() {
        /**
         * A list of ids, do not use.
         * 
         * @type {number[]}
         */
        this.__ids = [];
        for (let i = 0; i < 100; i++) {
            // This is to prevent cards from getting linked. Don't use this variable
            this.__ids.push(game.functions.randInt(0, 671678679546789));
        }

        return true;
    }

    /**
     * Adds a deathrattle to the card
     * 
     * @param {import("./types").KeywordMethod} _deathrattle The deathrattle to add
     * 
     * @returns {boolean} Success
     */
    addDeathrattle(_deathrattle) {
        if (!this.deathrattle) this.deathrattle = [];

        this.deathrattle.push(_deathrattle);

        // Just in case we want this function to ever fail, we make it return success.
        return true;
    }

    // Keywords

    /**
     * Adds a keyword to the card
     * 
     * @param {string} keyword The keyword to add
     * 
     * @returns {boolean} Success
     */
    addKeyword(keyword) {
        if (this.keywords.includes(keyword)) return false;

        this.keywords.push(keyword);

        if (keyword === "Charge") this.sleepy = false;
        else if (keyword === "Rush") {
            this.sleepy = false;
            this.canAttackHero = false;
        }

        return true;
    }

    /**
     * @deprecated Use `game.functions.remove(card.keywords, "Taunt")`
     * 
     * Removes a keyword from the card
     * 
     * @param {string} keyword The keyword to remove
     * 
     * @returns {boolean} Success
     */
    removeKeyword(keyword) {
        this.keywords = this.keywords.filter(k => k != keyword);

        return true;
    }

    /**
     * Freeze the card
     *
     * @returns {boolean} Success
     */
    freeze() {
        this.frozen_turn = game.turns;
        this.frozen = true;

        game.events.broadcast("FreezeCard", this, this.plr);

        return true;
    }

    /**
     * Mark a card as having attacked once, and if it runs out of attacks this turn, exhaust it.
     *
     * @returns {boolean} Success
     */
    decAttack() {
        this.attackTimes--;

        const shouldExhaust = (this.attackTimes <= 0);
        if (shouldExhaust) this.sleepy = true;

        return true;
    }
    
    /**
     * Makes this minion ready for attack
     * 
     * @returns {boolean} Success
     */
    ready() {
        this.sleepy = false;
        this.resetAttackTimes();

        return true;
    }

    // Change stats

    /**
     * @returns {number} The card's attack
     */
    getAttack() {
        return this.stats[0];
    }

    /**
     * @returns {number} The card's health
     */
    getHealth() {
        return this.stats[1];
    }

    /**
     * Sets the card's attack and health.
     * 
     * @param {number} [attack=null] The attack to set
     * @param {number} [health=null] The health to set
     * @param {boolean} [changeMaxHealth=true] If the card's max health should be reset to it's current health if the health increases from running this function.
     * 
     * @returns {boolean} Success
     */
    setStats(attack = null, health = null, changeMaxHealth = true) {
        if (attack == null) attack = this.getAttack();
        if (health == null) health = this.getHealth();

        this.stats = [attack, health];

        if (changeMaxHealth && health > this.maxHealth) this.maxHealth = health;

        return true;
    }

    /**
     * Adds `attack` and `health` to the card.
     * 
     * @param {number} [attack=0] The attack to add
     * @param {number} [health=0] The health to add
     * @param {boolean} [restore=false] Should cap the amount of health added to it's max health.
     * 
     * @returns {boolean} Success
     */
    addStats(attack = 0, health = 0, restore = false) {
        this.addAttack(attack);
        this.addHealth(health, restore);

        return true;
    }

    /**
     * Removes `attack` and `health` from the card.
     * 
     * @param {number} [attack=0] The attack to remove
     * @param {number} [health=0] The health to remove
     * 
     * @returns {boolean} Success
     */
    remStats(attack = 0, health = 0) {
        this.remAttack(attack);
        this.remHealth(health);

        return true;
    }

    /**
     * Adds `amount` to the card's health
     * 
     * @param {number} amount The health to add
     * @param {boolean} [restore=true] Should reset health to it's max health if it goes over it's max health
     * 
     * @returns {boolean} Success
     */
    addHealth(amount, restore = true) {
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

    /**
     * Adds `amount` to the card's attack
     * 
     * @param {number} amount The attack to add
     * 
     * @returns {boolean} Success
     */
    addAttack(amount) {
        this.setStats(this.getAttack() + amount, this.getHealth());

        return true;
    }

    /**
     * Damages a card.
     * 
     * Doesn't damage the card if it is a location card, is immune, or has Stealth.
     * 
     * @param {number} amount The health to remove
     * 
     * @returns {boolean} Success
     */
    remHealth(amount) {
        if (this.type == "Location") return false; // Don't allow location cards to be damaged
        if (this.keywords.includes("Stealth")) return false;

        if (this.immune) return true;

        this.setStats(this.getAttack(), this.getHealth() - amount);
        game.events.broadcast("DamageMinion", [this, amount], this.plr);

        if (this.type == "Weapon" && this.getHealth() <= 0) {
            this.plr.destroyWeapon(true);
        }

        return true;
    }

    /**
     * Removes `amount` from the card's attack
     * 
     * @param {number} amount The attack to remove
     * 
     * @returns {boolean} Success
     */
    remAttack(amount) {
        this.setStats(this.getAttack() - amount, this.getHealth());

        return true;
    }

    /**
     * Sets the max health of the card to it's current health. If check is true it only sets the max health if the current health is above it.
     * 
     * @param {boolean} [check=false] Prevent lowering it's max health
     * 
     * @returns {boolean} If it reset the card's max health.
     */
    resetMaxHealth(check = false) {
        if (check && this.getHealth() <= this.maxHealth) return false;

        this.maxHealth = this.getHealth();
        return true;
    }

    // Set other

    /**
     * Sets stealth to only last `duration` amount of turns
     * 
     * @param {number} duration The amount of turns stealth should last
     * 
     * @returns {boolean} Success.
     */
    setStealthDuration(duration) {
        this.stealthDuration = game.turns + duration;

        return true;
    }

    /**
     * Sets the attack times of a card to;
     * 1 if doesn't have windfury,
     * 2 if it does,
     * 4 if it has mega-windfury.
     * 
     * @returns {boolean} Success
     */
    resetAttackTimes() {
        this.attackTimes = 1;

        if (this.keywords.includes("Windfury")) {
            this.attackTimes = 2;
        }
        if (this.keywords.includes("Mega-Windfury")) {
            this.attackTimes = 4;
        }

        return true;
    }

    /**
     * Create a backup of the card.
     *
     * @returns {number} The key of the backup. You can use it by doing `card.backups[key]`
     */
    createBackup() {
        let key = Object.keys(this.backups).length;
        this.backups[key] = {};
        Object.entries(this).forEach(i => this.backups[key][i[0]] = i[1]);
        
        return key;
    }

    /**
     * Restore a backup of the card.
     *
     * @param {Object} backup The backup to restore. It is recommended to supply a backup from `card.backups`.
     *
     * @returns {boolean} Success
     */
    restoreBackup(backup) {
        Object.keys(backup).forEach(att => {
            this[att] = backup[att];
        });

        return true;
    }

    // Doom buttons

    /**
     * Kills the card.
     *
     * @returns {boolean} Success
     */
    kill() {
        this.setStats(this.getAttack(), 0);
        game.killMinions();

        return true;
    }

    /**
     * Silences the card.
     * 
     * @returns {boolean} Success
     */
    silence() {
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

    /**
     * Silences, then kills the card.
     * 
     * @returns {boolean} Success
     */
    destroy() {
        this.silence();
        this.kill();

        return true;
    }

    // Handling functions

    /**
     * Activates a keyword method
     * 
     * @param {string} name The method to activate
     * @param {any} [args] Pass these args to the method
     * 
     * @returns {any[] | -1} All the return values of the method keywords
     */
    activate(name, ...args) {
        // This activates a function
        // Example: activate("cast")
        // Do: this.cast.forEach(cast_func => cast_func(plr, game, card))
        // Returns a list of the return values from all the function calls

        name = name.toLowerCase();

        // If the card has the function
        if (!this[name]) return false;

        let ret = [];
        
        this[name].forEach(func => {
            if (ret === -1) return;

            // Check if the method is conditioned
            if (this.conditioned && this.conditioned.includes(name) && this.activate("condition")[0] === false) return;

            let r = func(this.plr, game, this, ...args);
            ret.push(r);

            if (r != -1 || name == "deathrattle") return; // Deathrattle isn't cancellable

            // If the return value is -1, meaning "refund", refund the card and stop the for loop
            game.events.broadcast("CancelCard", [this, name], this.plr);

            ret = -1;

            // These keyword methods shouldn't "refund" the card, just stop execution.
            if (["use", "heropower"].includes(name)) return;

            game.suppressedEvents.push("AddCardToHand");
            this.plr.addToHand(this);
            game.suppressedEvents.pop();

            this.plr[this.costType] += this.mana;

            // Return from the for loop
            return;
        });

        return ret;
    }

    /**
     * Activates a card's battlecry
     * 
     * @param {any} [args] Any arguments to pass to battlecry.
     * 
     * @returns {any[] | -1} The return values of all the battlecries triggered
     */
    activateBattlecry(...args) {
        this.activate("passive", "battlecry", this, game.turns);
        return this.activate("battlecry", ...args);
    }
    /**
     * Returns `[true, t]` if `m` is more than or equal to the player's max mana, otherwise return `[false, f]`.
     * 
     * If `t` and `f` are not defined. This function only returns a boolean.
     *
     * @param {number} m The mana to test
     * @param {any} [t=""] The value to return if true
     * @param {any} [f=""] The value to return if false
     * 
     * @returns {[boolean, any] | boolean}
     */
    manathirst(m, t = "", f = "") {
        if (this.plr.maxMana < m) {
            if (!f) return false;

            return [false, f];
        }

        if (!t) return true;
        return [true, t];
    }

    /**
     * Get information from an enchantment.
     *
     * @param {string} e The enchantment string
     * 
     * @example
     * let info = getEnchantmentInfo("mana = 1");
     * assert.equal(info, {"key": "mana", "val": "1", "op": "="});
     *
     * @returns {{key: string, val: string, op: string}} The info
     */
    getEnchantmentInfo(e) {
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

    /**
     * Runs through this card's enchantments list and applies each enchantment in order.
     *
     * @returns {boolean} Success
     */
    applyEnchantments() {
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

    /**
     * Add an enchantment to the card. The enchantments look something like this: `mana = 1`, `+1 mana`, `-1 mana`.
     *
     * @warning DO NOT PASS USER INPUT DIRECTLY INTO THIS FUNCTION.
     * 
     * @param {string} e The enchantment string
     * @param {Card} card The creator of the enchantment. This will allow removing or looking up enchantment later.
     *
     * @returns {boolean} Success
     */
    addEnchantment(e, card) {
        let info = this.getEnchantmentInfo(e);

        if (info.op == "=") this.enchantments.unshift([e, card]); // Add the enchantment to the beginning of the list, equal enchantments should apply first
        else this.enchantments.push([e, card]);

        this.applyEnchantments();

        return true;
    }

    /**
     * Checks if an enchantment exists.
     *
     * @param {string} e The enchantment to look for.
     * @param {Card} card The owner of the enchantment. This needs to be correct to find the right enchantment.
     * @see {@link addEnchantment} for more info about `card`.
     * 
     * @returns {boolean} If the enchantment exists
     */
    enchantmentExists(e, card) {
        return this.enchantments.find(c => c[0] == e && c[1] == card);
    }

    /**
     * Removes an enchantment
     *
     * @param {string} e The enchantment to remove
     * @param {Card} card The owner of the enchantment.
     * @see {@link enchantmentExists} for more info about `card`.
     * @param {boolean} [update=true] Keep this enabled unless you know what you're doing.
     *
     * @returns {boolean} Success
     */
    removeEnchantment(e, card, update = true) {
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

    /**
     * Replaces the placeholders (`{0}`) with their values
     * 
     * @returns {boolean} Success
     * 
     * @example
     * card.desc = "The current turn count is {0}";
     * card.placeholders = [(plr, game, self) => {
     *     let turns = Math.ceil(game.turns / 2);
     * 
     *     return {0: turns};
     * }];
     * card.replacePlaceholders();
     * 
     * // The `{ph:0}` tags are removed when displaying cards.
     * assert.equal(card.desc, "The current turn count is {ph:0} 1 {/ph}");
     */
    replacePlaceholders() {
        if (!this.placeholders) return;

        this.placeholder = this.activate("placeholders")[0];

        Object.entries(this.placeholder).forEach(p => {
            let [key, val] = p;

            let replacement = `{ph:${key}} ${val} {/ph}`;

            this.desc = this.desc.replace(new RegExp(`{ph:${key}} .*? {/ph}`, 'g'), replacement);
            this.desc = this.desc.replaceAll(`{${key}}`, replacement);
        });

        return true;
    }

    /**
     * Return a perfect copy of this card. This will perfectly clone the card. This happens when, for example, a card gets temporarily removed from the board using card.destroy, then put back on the board.
     *
     * @returns {Card} A perfect copy of this card.
     * 
     * @example
     * let cloned = card.perfectCopy();
     * let cloned2 = game.functions.cloneCard(card);
     * 
     * // This will actually fail since they're slightly different, but you get the point
     * assert.equal(cloned, cloned2);
     */
    perfectCopy() {
        return game.functions.cloneCard(this);
    }

    /**
     * Return an imperfect copy of this card. This happens when, for example, a card gets shuffled into your deck in vanilla Hearthstone.
     * 
     * @returns {Card} An imperfect copy of this card.
     * 
     * @example
     * let cloned = card.imperfectCopy();
     * let cloned2 = new Card(card.name, card.plr);
     * 
     * // This will actually fail since they're slightly different, but you get the point
     * assert.equal(cloned, cloned2);
     */
    imperfectCopy() {
        return new Card(this.name, this.plr);
    }
}

exports.Card = Card;
