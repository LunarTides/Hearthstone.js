let cards = {};
let game = null;

function setup(_cards, _game) {
    cards = _cards;
    game = _game;
}

class Card {
    constructor(name, plr) {
        this.blueprint = cards[name];

        const hasArray = [
            // Mutual keywords
            "outcast",
            "infuse",
            "combo",

            // Minion / Weapon keywords
            "battlecry",
            "deathrattle",
            "inspire",
            "endofturn",
            "startofturn",
            "onattack",
            "startofgame",
            "overkill",
            "frenzy",
            "honorablekill",
            "spellburst",
            "passive",
            "unpassive",

            // Spell keywords
            "cast",
            "castondraw",

            // Hero keywords
            "heropower"
        ]

        this.__ids = []
        
        for (let i = 0; i < 100; i++) {
            // This is to prevent cards from getting linked. Don't use this variable
            this.__ids.push(game.functions.randInt(0, 671678679546789));
        }
        
        this.name = name;
        this.plr = plr;

        this.displayName = name;

        this.type = game.functions.getType(this.blueprint);

        this.keywords = [];
        this.storage = []; // Allow cards to store data for later use

        this.turn = null;

        this.infuse_num = -1;

        this.spellClass = null;
        
        Object.entries(this.blueprint).forEach(i => {
            if (typeof i[1] == "function") this[i[0]] = [i[1]];
            else this[i[0]] = i[1];
        });

        this.attackTimes = 1;
        this.stealthDuration = 0;

        if (this.type == "Minion" || this.type == "Weapon") this.oghealth = this.stats[1];

        this.canAttackHero = true;

        this.deathrattles = this.hasDeathrattle ? [this.blueprint.deathrattle] : [];

        const exists = ["corrupted", "colossal", "dormant", "uncollectible", "frozen", "immune", "echo"];
        exists.forEach(i => {
            this[i] = this.blueprint[i] || false;
        });

        hasArray.forEach(i => {
            // this.hasBattlecry = false;
            this["has" + i[0].toUpperCase() + i.slice(1)] = this.blueprint[i] != undefined;
        });

        Object.entries(this).forEach(i => {
            this["_" + i[0]] = i[1];
        });
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
        const _name = name[0].toUpperCase() + name.slice(1).toLowerCase();

        this["has" + _name] = true;
        this[name] = val;
    }
    addDeathrattle(deathrattle) {
        this.hasDeathrattle = true;
        this.deathrattles.push(deathrattle);
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

        if (health > this.oghealth) {
            this.oghealth = health;
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
            if (this.stats[1] > this.oghealth) {
                game.stats.update("restoredHealth", this.oghealth);
                this.stats[1] = this.oghealth;
            } else {
                game.stats.update("restoredHealth", this.oghealth);
            }
        } else {
            this.oghealth = this.stats[1];
        }
    }
    addAttack(amount) {
        this.setStats(this.stats[0] + amount, this.stats[1]);
    }
    remHealth(amount) {
        this.setStats(this.stats[0], this.stats[1] - amount);

        if (this.type == "Weapon" && this.stats[1] <= 0) {
            this.activateDefault("deathrattle");
            this.plr.weapon = null;
        }
    }
    remAttack(amount) {
        this.setStats(this.stats[0] - amount, this.stats[1]);
    }
    resetOgHealth() {
        this.oghealth = this.stats[1];
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
        this.activateDefault("unpassive", false);

        Object.keys(this).forEach(att => {
            if (att.startsWith("has")) this[att] = false;
            else if (this["_" + att]) this[att] = this["_" + att];
            else if (this.blueprint[att]) this[att] = this.blueprint[att];
        });
        this.desc = "";
        this.keywords = [];
    }
    destroy() {
        this.silence();
        this.setStats(0, 0);
    }

    activate(name, before, after, ...args) {
        const _name = name[0].toUpperCase() + name.slice(1).toLowerCase();

        if (before) before(name, before, after, ...args);
        if (!this["has" + _name]) return false;
        let ret = [];
        this[name].forEach(i => ret.push(i(...args)));
        if (after) after(name, before, after, ret, ...args);
        return ret;
    }

    activateDefault(name, ...args) {
        return this.activate(name, null, null, this.plr, game, this, ...args);
    }

    activateBattlecry(...args) {
        return this.activate("battlecry", () => this.activateDefault("passive", ["battlecry", this]), null, this.plr, game, this, ...args);
    }

    passiveCheck(trigger, check_plr = this.plr) {
        return trigger[1].plr == check_plr;
    }
}

exports.Card = Card;
exports.setup_card = setup;