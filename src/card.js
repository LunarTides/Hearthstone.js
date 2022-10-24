let cards = {};
let game = null;

function setup(_cards, _game) {
    cards = _cards;
    game = _game;
}

class Card {
    constructor(name, plr) {
        this.blueprint = cards[name];
        
        this.name = name;
        this.displayName = name;

        this.type = game.functions.getType(this.blueprint);

        this.keywords = [];
        this.storage = []; // Allow cards to store data for later use

        this.turn = null; // The turn the card was played

        this.infuse_num = -1; // The amount of infuse a card has. Set to -1 for no infuse.

        this.spellClass = null;
        
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
        Do: this.hasCast = true; this.cast = [{ plr.gainMana(1) }]
                                             ^                   ^
                            This is in an array so we can add multiple events on casts
        */
        Object.entries(this.blueprint).forEach(i => {
            if (typeof i[1] == "function") {
                this[i[0]] = [i[1]];
                this["has" + game.functions.capitalize(i[0])] = true;
            }
            else this[i[0]] = i[1];
        });

        this.attackTimes = 1; // The number of times a minion can attack, windfury: 2, mega-windfury: 3
        this.stealthDuration = 0; // The amount of turns stealth should last

        // Set maxHealth if the card is a minion or weapon
        if (this.type == "Minion" || this.type == "Weapon") this.maxHealth = this.stats[1];

        this.canAttackHero = true;

        // This is here to prevent errors
        this.deathrattle = this.hasDeathrattle ? [this.blueprint.deathrattle] : [];

        // Set these variables to true or false.
        const exists = ["corrupted", "colossal", "dormant", "uncollectible", "frozen", "immune", "echo"];
        exists.forEach(i => {
            this[i] = this.blueprint[i] || false;
        });

        // Make a backup of "this" to be used when silencing this card
        Object.entries(this).forEach(i => {
            this["_" + i[0]] = i[1];
        });

        this.plr = plr;

        this.__ids = []
        for (let i = 0; i < 100; i++) {
            // This is to prevent cards from getting linked. Don't use this variable
            this.__ids.push(game.functions.randInt(0, 671678679546789));
        }
    }

    getName() {
        return this.name;
    }
    getType() {
        return this.type;
    }
    getDesc() {
        return this.desc;
    }
    getMana() {
        return this.mana;
    }
    getClass() {
        return this.class;
    }
    getRarity() {
        return this.rarity;
    }
    getSet() {
        return this.set;
    }
    getKeywords() {
        return this.keywords;
    }
    getTribe() {
        return this.tribe;
    }


    setName(name) {
        this.name = name;
    }
    setType(type) {
        this.type = type;
    }
    setDesc(desc) {
        this.desc = desc;
    }
    setMana(mana) {
        this.mana = mana;
    }
    setClass(_class) {
        this.class = _class;
    }
    setRarity(rarity) {
        this.rarity = rarity;
    }
    setSet(set) {
        this.set = set;
    }
    setKeywords(keywords) {
        this.keywords = keywords;
    }
    setFunction(name, val) {
        // Set has[Func] to true | false
        // Example: name = "cast", val = false
        // Do: this.hasCast = false;
        // This prevents "cast" from being called when casting a spell, making it useless.

        const _name = game.functions.capitalize(name);

        this["has" + _name] = true;
        this[name] = val;
    }
    addDeathrattle(_deathrattle) {
        this.hasDeathrattle = true;
        this.deathrattle.push(_deathrattle);
    }

    addKeyword(keyword) {
        this.keywords.push(keyword);

        if (this.keywords.includes("Charge") && this.turn == game.turns) {
            this.turn = game.turns - 1;
        }

        if (this.keywords.includes("Rush") && this.turn == game.turns) {
            this.turn = game.turns - 1;
            this.canAttackHero = false;
        }
    }
    removeKeyword(keyword) {
        this.keywords = this.keywords.filter(k => k != keyword);
    }

    getStats() {
        return this.stats;
    }
    setStats(attack = this.stats[0], health = this.stats[1]) {
        this.stats = [attack, health];

        if (health > this.maxHealth) {
            this.maxHealth = health;
        }
    }

    addStats(attack = 0, health = 0) {
        this.addAttack(attack);
        this.addHealth(health);
    }
    remStats(attack = 0, health = 0) {
        this.remAttack(attack);
        this.remHealth(health);
    }

    addHealth(amount, restore = true) {
        this.setStats(this.stats[0], this.stats[1] + amount);
    
        if (restore) {
            if (this.stats[1] > this.maxHealth) {
                game.stats.update("restoredHealth", this.maxHealth);
                this.stats[1] = this.maxHealth;
            } else {
                game.stats.update("restoredHealth", this.stats[1]);
            }
        }
        else this.resetMaxHealth(true);
    }
    addAttack(amount) {
        this.setStats(this.stats[0] + amount, this.stats[1]);
    }
    remHealth(amount) {
        this.setStats(this.stats[0], this.stats[1] - amount);

        if (this.type == "Weapon" && this.stats[1] <= 0) {
            this.plr.destroyWeapon(true);
        }
    }
    remAttack(amount) {
        this.setStats(this.stats[0] - amount, this.stats[1]);
    }
    resetMaxHealth(check = false) {
        if (check && this.stats[1] <= this.maxHealth) return;

        this.maxHealth = this.stats[1];
    }
    setStealthDuration(duration) {
        this.stealthDuration = game.turns + duration;
    }

    resetAttackTimes() {
        this.attackTimes = 1;

        if (this.keywords.includes("Windfury")) {
            this.attackTimes = 2;
        }
        if (this.keywords.includes("Mega-Windfury")) {
            this.attackTimes = 3;
        }
    }

    silence() {
        // Tell the minion to undo it's passive.
        // The false tells the minion that this is the last time it will call unpassive
        // so it should finish whatever it is doing.
        this.activate("unpassive", false);

        Object.keys(this).forEach(att => {
            // Set all attributes that starts with "has" to false
            if (att.startsWith("has")) this[att] = false;

            // Check if a backup exists for the attribute. If it does; restore it.
            else if (this["_" + att]) this[att] = this["_" + att];

            // Check if the attribute if defined in the blueprint. If it is; restore it.
            else if (this.blueprint[att]) this[att] = this.blueprint[att];
        });
        this.desc = "";
        this.keywords = [];
    }
    destroy() {
        this.silence();
        this.setStats(0, 0);
    }

    activate(name, ...args) {
        // This activates a function
        // Example: activate("cast")¨
        // Do: this.cast.forEach(cast_func => cast_func(plr, game, card))
        // Returns a list of the return values from all the function calls

        name = name.toLowerCase();

        // If the card has the function
        if (!this["has" + game.functions.capitalize(name)]) return false;

        let ret = [];
        this[name].forEach(i => {
            let r = i(this.plr, game, this, ...args);
            ret.push(r);

            // If the return value is -1, meaning "refund", refund the card and stop the for loop
            if (r == -1 && name != "deathrattle") {
                game.functions.addToHand(this, this.plr, false);
                this.plr.mana += this.mana;
                ret = -1;

                // Return from the for loop
                return;
            }
        });

        return ret;
    }

    activateBattlecry(...args) {
        this.activate("passive", ["battlecry", this]);
        return this.activate("battlecry", ...args);
    }

    passiveCheck(trigger, key, val = null, check_plr = null) {
        let ret;

        if (Array.isArray(key)) ret = !!key.filter(v => v == trigger[0]).length;
        else ret = trigger[0] == key;
        if (val) {
            if (Array.isArray(val)) ret = ret && !!val.filter(v => v == trigger[1]).length;
            else ret = ret && trigger[1] == val;
        }
        if (check_plr) {
            if (typeof trigger[1] == game.Player) ret = ret && !!trigger[1].filter(v => v.plr && v.plr == check_plr).length;
            else ret = ret && trigger[1].plr == check_plr;
        }

        return ret;
    }
}

exports.Card = Card;
exports.setup_card = setup;