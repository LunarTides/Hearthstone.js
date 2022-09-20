const fs = require('fs');
const { exit } = require('process');
const rl = require('readline-sync');
const crypto = require('crypto');

const _debug = true; // Enables commands like /give, /class and /eval. Disables naming and assigning passcodes to players.
                     // Enable for debugging, disable for actual play.

var cards = {};

function importCards(path) {
    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        if (file.name.endsWith(".js")) {
            var f = require(`${path}/${file.name}`);
            cards[f.name] = f;
        } else if (file.isDirectory()) {
            importCards(`${path}/${file.name}`);
        }
    });
}

importCards(__dirname + '/cards');

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
            this.__ids.push(Math.floor(Math.random() * 671678679546789));
        }
        
        this.name = name;
        this.plr = plr;

        this.displayName = this.check(this.blueprint.displayName, name);
        this.type = "Card";

        this.keywords = this.check(this.blueprint.keywords, []);
        this.storage = []; // Allow cards to store data for later use

        this.turn = null;

        this.echo = false;

        this.infuse_num = this.check(this.blueprint.infuse_num, -1);
        
        Object.entries(this.blueprint).forEach(i => {
            if (typeof i[1] !== "function") this[i[0]] = i[1];
            else this[i[0]] = [i[1]];
        });

        const exists = ["corrupted", "colossal", "dormant", "uncollectible"];
        Object.keys(exists).forEach(i => {
            this[i] = this.check(i);
        });

        hasArray.forEach(i => { // You have to define hasArray when extending this class
            // this.hasBattlecry = false;
            this["has" + i[0].toUpperCase() + i.slice(1)] = this.blueprint[i] != undefined;
        });
    }

    check(check, alt_value=false) {
        return check || alt_value;
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
    setStats(stats) {
        this.stats = stats;
    }

    addStats(attack = 0, health = 0) {
        this.addAttack(attack);
        this.addHealth(health);
    }
    remStats(attack = 0, health = 0) {
        this.remAttack(attack);
        this.remHealth(health);
    }

    addHealth(amount) {
        this.setStats(this.stats[0], this.stats[1] + amount)
    }
    addAttack(amount) {
        this.setStats(this.stats[0] + amount, this.stats[1]);
    }
    remHealth(amount) {
        this.setStats(this.stats[0], this.stats[1] - amount);
    }
    remAttack(amount) {
        this.setStats(this.stats[0] - amount, this.stats[1]);
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
        Object.keys(this).forEach(att => {
            if (att.startsWith("has")) this[att] = false;
            else if (this["_" + att]) this[att] = this["_" + att];
            else if (this.blueprint[att]) this[att] = this.blueprint[att];
        });
        this.desc = "";
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

    activateDefault(name, card, ...args) {
        if (typeof args[0] === "object" && typeof args[0][0] === "string") return this.activate(name, null, null, card.plr, game, ...args);
        else return this.activate(name, null, null, card.plr, game, card, ...args);
    }
}

class Minion extends Card {
    constructor(name, plr) {
        super(name, plr);

        this.type = "Minion";

        this.oghealth = this.stats[1];
        this.attackTimes = 1;
        this.stealthDuration = 0;

        this.frozen = false;
        this.immune = false;
        this.dormant = false;
        this.corrupted = false;
        this.canAttackHero = true;

        this.deathrattles = this.hasDeathrattle ? [this.blueprint.deathrattle] : [];
    }

    setStats(attack = this.stats[0], health = this.stats[1]) {
        this.stats = [attack, health];

        if (health > this.oghealth) {
            this.oghealth = health;
        }
    }

    resetOgHealth() {
        this.oghealth = this.stats[1];
    }

    setStealthDuration(duration) {
        this.stealthDuration = game.turns + duration;
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

}

class Spell extends Card {
    constructor(name, plr) {
        super(name, plr);

        this.type = "Spell";

        this.spellClass = this.check(this.blueprint.spellClass, null);
    }
}

class Weapon extends Card {
    constructor(name, plr) {
        super(name, plr);

        this.type = "Weapon";

        this.attackTimes = 1;

        this.deathrattles = this.hasDeathrattle ? [this.blueprint.deathrattle] : [];
    }

    remHealth(amount) {
        this.setStats(this.stats[0], this.stats[1] - amount);

        if (this.stats[1] <= 0) {
            this.activateDefault("deathrattle", this);

            this.plr.weapon = null;
        }
    }
}

class Hero extends Card {
    constructor(name, plr) {
        super(name, plr);

        this.type = "Hero";
    }
}


class Player {
    constructor(name) {
        this.name = name;
        this.passcode = "";
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
        this.hasPlayedCardThisTurn = false;
        this.frozen = false;
        this.immune = false;
        this.overload = 0;
        this.spellDamage = 0;
        this.counter = [];
        this.secrets = [];
        this.sidequests = [];
        this.quests = [];
        this.questlines = [];
    }

    getName() {
        return this.name;
    }

    getDeck() {
        return this.deck;
    }

    getHand() {
        return this.hand;
    }

    getMana() {
        return this.mana;
    }

    getMaxMana() {
        return this.maxMana;
    }

    getGame() {
        return this.game;
    }

    getWeapon() {
        return this.weapon;
    }

    setName(name) {
        this.name = name;
    }

    setDeck(deck) {
        this.deck = deck;
    }

    setHand(hand) {
        this.hand = hand;
    }

    setMana(mana) {
        this.mana = mana;
    }

    setMaxMana(maxMana) {
        this.maxMana = maxMana;

        if (maxMana > this.maxMaxMana) this.maxMana = this.maxMaxMana;
    }

    setMaxMaxMana(maxMaxMana) {
        this.maxMaxMana = maxMaxMana;
    }

    refreshMana(mana) {
        this.mana += mana;

        if (this.mana > this.maxMana) this.mana = this.maxMana;
    }

    setGame(game) {
        this.game = game;
    }

    setWeapon(weapon) {
        this.weapon = weapon;

        this.attack += weapon.getStats()[0];
    }

    setHero(hero) {
        this.hero = hero;

        this.hero_power = "hero";
    }

    addOverload(amount) {
        this.overload += amount;
    }

    addAttack(amount) {
        this.attack += amount;

        game.stats.update("heroAttackGained", amount);
    }

    addHealth(amount) {
        this.health += amount;

        if (this.health > this.maxHealth) this.health = this.maxHealth;
    }

    remHealth(amount) {
        var a = amount;

        while (this.armor > 0 && a > 0) {
            a--;
            this.armor--;
        }

        if (a <= 0) return true;

        this.health -= a;

        if (game.turn == this) {
            game.stats.update("damageTakenOnOwnTurn", amount);
        }

        if (this.health <= 0) {
            this.game.stats.update("fatalDamageTimes", 1);

            if (this.health <= 0) { // This is done to allow secrets to prevent death
                this.game.endGame(game.nextTurn);
            }
        }
    }

    shuffleIntoDeck(card, updateStats = true) {
        // Add the card into a random position in the deck
        var pos = Math.floor(Math.random() * this.deck.length);
        this.deck.splice(pos, 0, card);

        if (updateStats) {
            this.game.stats.update("cardsAddedToDeck", card);
        }
    }

    addToBottomOfDeck(card) {
        this.deck = [card, ...this.deck];

        this.game.stats.update("cardsAddedToDeck", card);
    }

    drawCard() {
        if (this.deck.length <= 0) {
            this.fatigue++;

            this.remHealth(this.fatigue);
            
            return;
        }

        var card = this.deck.pop()

        if (card.type == "Spell") {
            if (card.activateDefault("castondraw", card)) {
                return null;
            }
        }

        this.game.functions.addToHand(card, this, false);

        game.stats.update("cardsDrawn", card);
        game.stats.update("cardsDrawnThisTurn", card);

        return card;
    }

    heroPower() {
        if (this.hero_power == "Demon Hunter") this.heroPowerCost = 1;
        else this.heroPowerCost = 2; // This is to prevent changing hero power to demon hunter and changing back to decrease cost to 1

        if (this.getMana() < this.heroPowerCost || !this.canUseHeroPower) return false;

        if (this.hero && this.hero_power == "hero") {
            if (this.hero.activateDefault("heropower", this.hero) != -1) {
                this.setMana(this.getMana() - this.heroPowerCost);

                game.stats.update("heroPowers", this.hero_power);

                this.canUseHeroPower = false;
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
            this.game.nextTurn.remHealth(2);
        }
        else if (this.hero_power == "Mage") {
            var t = this.game.functions.selectTarget("Deal 1 damage.", "heropower");

            if (!t) return false;

            if (t instanceof Player) {
                t.remHealth(1);
            } else {
                game.attackMinion(1, t);
            }
        }
        else if (this.hero_power == "Paladin") {
            game.playMinion(new Minion("Silver Hand Recruit", this), this);
        }
        else if (this.hero_power == "Priest") {
            var t = this.game.functions.selectTarget("Restore 2 health.", "heropower");

            if (!t) return false;

            t.addHealth(2);
        }
        else if (this.hero_power == "Rogue") {
            this.weapon = new Weapon("Wicked Knife", this);
        }
        else if (this.hero_power == "Shaman") {
            const totem_cards = ["Healing Totem", "Searing Totem", "Stoneclaw Totem", "Strength Totem"];

            game.getBoard()[this.id].forEach(m => {
                if (totem_cards.includes(m.displayName)) {
                    totem_cards.splice(totem_cards.indexOf(m.displayName), 1);
                }
            });

            if (totem_cards.length == 0) {
                return;
            }

            game.playMinion(new Minion(game.functions.randList(totem_cards), this), this);
        }
        else if (this.hero_power == "Warlock") {
            this.remHealth(2);

            this.drawCard();
        }
        else if (this.hero_power == "Warrior") {
            this.armor += 2;
        }

        this.game.getBoard()[this.id].forEach(m => {
            m.activateDefault("inspire", m);
        });

        this.setMana(this.getMana() - this.heroPowerCost);

        game.stats.update("heroPowers", this.hero_power);

        this.canUseHeroPower = false;

    }

}

class Game {
    constructor(player1, player2, functions) {
        // Choose a random player to be player 1
        if (Math.random() < 0.5) {
            this.player1 = player1;
            this.player2 = player2;
        } else {
            this.player1 = player2;
            this.player2 = player1;
        }

        this.turn = this.player1;
        this.nextTurn = this.player2;

        this.functions = functions;
        this.cards = cards;
        this.stats = new GameStats();

        this.printName = printName;
        this.input = rl.question;

        this.Minion = Minion;
        this.Weapon = Weapon;
        this.Spell = Spell;
        this.Player = Player;

        this.player1.id = 0;
        this.player2.id = 1;

        this.turns = 0;
        this.winner = null;
        this.loser = null;
        this.board = [[], []];
        
        this.player1.setGame(this);
        this.player2.setGame(this);
    }

    getPlayer1() {
        return this.player1;
    }

    getPlayer2() {
        return this.player2;
    }

    getTurn() {
        return this.turn;
    }

    getTurns() {
        return this.turns;
    }

    getWinner() {
        return this.winner;
    }

    getLoser() {
        return this.loser;
    }

    getBoard() {
        return this.board;
    }

    setPlayer1(player1) {
        this.player1 = player1;
    }

    setPlayer2(player2) {
        this.player2 = player2;
    }

    setTurn(turn) {
        this.turn = turn;
    }

    setTurns(turns) {
        this.turns = turns;
    }

    setWinner(winner) {
        this.winner = winner;
    }

    setLoser(loser) {
        this.loser = loser;
    }

    setBoard(board) {
        this.board = board;
    }

    plrNameToIndex(name) {
        if (this.player1.getName() == name) return 0;
        if (this.player2.getName() == name) return 1;
        
        return -1;
    }

    plrIndexToName(index) {
        if (index == 0) return this.player1.getName();
        if (index == 1) return this.player2.getName();

        return null;
    }

    plrIndexToPlayer(index) {
        if (index == 0) return this.player1;
        if (index == 1) return this.player2;
    }

    getOtherPlayer(player) {
        if (player == this.player1) return this.player2;
        if (player == this.player2) return this.player1;
    }

    startGame() {
        for (let i = 0; i < 3; i++) {
            this.player1.drawCard()
        }

        for (let i = 0; i < 4; i++) {
            this.player2.drawCard();
        }
        this.functions.addToHand(new Spell("The Coin", this.player2), this.player2, false)

        this.player1.setMaxMana(1);
        this.player1.setMana(1);

        this.turns += 1;

        this.player1.deck.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateDefault("startofgame", c);
            }
        });
        this.player2.deck.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateDefault("startofgame", c);
            }
        });

        this.player1.hand.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateDefault("startofgame", c);
            }
        });
        this.player2.hand.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateDefault("startofgame", c);
            }
        });
    }

    endGame(p) {
        printName();

        console.log(`Player ${p.getName()} wins!`);

        exit(0);
    }

    endTurn() {
        game.stats.update("turnEnds", game.turns);
        game.stats.cardsDrawnThisTurn[game.turn.id] = [];

        if (game.turn.mana > 0) {
            game.stats.update("unspentMana", game.turn.mana);
        }

        this.getBoard()[this.turn.id].forEach(m => {
            m.activateDefault("endofturn", m);
        });

        let _c = this.player1.hand.filter(c => !c.echo)
        this.player1.setHand(_c);

        _c = this.player2.hand.filter(c => !c.echo)
        this.player2.setHand(_c);

        this.turn.attack = 0;
        this.turn = this.nextTurn;

        this.turn.setMaxMana(this.turn.getMaxMana() + 1);
        this.turn.setMana(this.turn.getMaxMana());

        this.nextTurn = this.getOtherPlayer(this.turn);

        this.turns += 1;
    }

    startTurn() {
        game.stats.update("turnStarts", game.turns);

        if (this.turn.passcode) {
            printName()

            const passcode = rl.question(`\nPlayer ${this.turn.id + 1} (${this.turn.name}), please enter your passcode: `, {hideEchoBack: true});

            if (this.turn.passcode != crypto.createHash('sha256').update(passcode).digest('hex')) {
                rl.question("Incorrect passcode!\n");
                this.startTurn();
                return;
            }
        }

        printName()

        if (this.turn.weapon && this.turn.weapon.stats[0]) {
            this.turn.attack += this.turn.weapon.stats[0];
        }

        this.turn.mana -= this.turn.overload;
        this.turn.overload = 0;

        if (this.player1.weapon && this.turn == this.player1) {
            this.player1.weapon.activateDefault("startofturn", this.player1.weapon);
        }
        if (this.player2.weapon && this.turn == this.player2) {
            this.player2.weapon.activateDefault("startofturn", this.player2.weapon);
        }

        this.getBoard()[this.plrNameToIndex(this.turn.getName())].forEach(m => {
            m.activateDefault("startofturn", m);
            m.canAttackHero = true;
            m.resetAttackTimes();

            if (m.stealthDuration > 0 && this.turns > m.stealthDuration) {
                m.stealthDuration = 0;
                m.removeKeyword("Stealth");
            }

            if (m.dormant) {
                if (game.turns > m.dormant) {
                    m.dormant = false;
                    m.frozen = false;
                    m.immune = false;

                    m.activate("battlecry", () => m.activateDefault("passive", m, ["battlecry", m]), null, m.plr, this, m);
                }

                m.turn = game.turns;
            } else {
                m.frozen = false;
            }
        });

        if (this.turn.weapon && this.turn.weapon.stats[0]) this.turn.weapon.resetAttackTimes();

        this.turn.drawCard();

        this.turn.canUseHeroPower = true;
    }

    playCard(card, player) {
        if (player.getMana() < card.getMana()) {
            return false;
        }

        if (card.keywords.includes("Tradeable")) {
            var q = rl.question(`Would you like to trade ${card.displayName} for a random card in your deck? (y: trade / n: play) `);

            if (q.startsWith("y")) {
                if (player.getMana() < 1) {
                    return false;
                }

                player.setMana(player.getMana() - 1);

                player.shuffleIntoDeck(card);

                var n = []

                var found = false;

                player.getHand().forEach(function(c) {
                    if (c.displayName === card.displayName && !found) {
                        found = true;
                    } else {
                        n.push(c);
                    }
                });

                if (card instanceof Spell && card.keywords.includes("Twinspell")) {
                    card.removeKeyword("Twinspell");
                    card.setDesc(card.getDesc().split("Twinspell")[0].trim());
        
                    n.push(card);
                }
        
                if (card.keywords.includes("Echo")) {
                    let clone = Object.assign(Object.create(Object.getPrototypeOf(card)), card)
                    clone.echo = true;
        
                    n.push(clone);
                }
        
                player.setHand(n);

                player.drawCard();
                return false;
            }
        }

        player.setMana(player.getMana() - card.getMana());
        
        var n = []

        var found = false;

        player.getHand().forEach(function(c) {
            if (c.displayName === card.displayName && !found) {
                found = true;
            } else {
                n.push(c);
            }
        });

        if (card instanceof Spell && card.keywords.includes("Twinspell")) {
            card.removeKeyword("Twinspell");
            card.setDesc(card.getDesc().split("Twinspell")[0].trim());

            n.push(card);
        }

        if (card.keywords.includes("Echo")) {
            let clone = Object.assign(Object.create(Object.getPrototypeOf(card)), card)
            clone.echo = true;

            n.push(clone);
        }

        player.setHand(n);

        if (card.getType() == "Minion" && game.board[player.id].length > 0 && card.keywords.includes("Magnetic")) {
            let hasMech = false;

            game.board[player.id].forEach(m => {
                if (m.tribe == "Mech") {
                    hasMech = true;
                }
            });

            while (hasMech) {
                let m = rl.question("Do you want to magnetize this minion to a mech? (y: yes / n: no) ");
                if (!m.toLowerCase().startsWith("y")) break;

                let loc = game.functions.selectTarget(`\nWhich minion do you want this to Magnetize to: `, false, "self", "minion");

                game.stats.update("minionsPlayed", [card, game.turns]);

                if (loc.tribe == "Mech") {
                    loc.addStats(card.stats[0], card.stats[1]);

                    card.keywords.forEach(k => {
                        loc.addKeyword(k);
                    });

                    loc.oghealth += card.oghealth;

                    card.deathrattles.forEach(d => {
                        loc.addDeathrattle(d);
                    });

                    return true;
                }
            }

        }

        if (card.getType() === "Minion") {
            if (player.counter && player.counter.includes("Minion")) {
                player.counter.splice(player.counter.indexOf("Minion"), 1);
    
                rl.question("Your minion has been countered.\n")
    
                return;
            }
    
            if (this.board[player.id].length >= 7) {
                rl.question("\nYou can only have 7 minions on the board.\n");
                this.functions.addToHand(card, player, false);
                player.mana += card.mana;
                return;
            }

            if (card.dormant) {
                card.frozen = true;
                card.immune = true;
                card.dormant = card.dormant + game.turns;
            } else {
                if (card.activate("battlecry", () => card.activateDefault("passive", card, ["battlecry", card]), null, card.plr, this, card) === -1) {
                    this.functions.addToHand(card, player, false);
                    player.mana += card.mana;
                    return;
                }
            }

            game.stats.update("minionsPlayed", [card, game.turns]);

            if (card.colossal) {
                card.colossal.forEach((v, i) => {
                    let minion = new Minion(v[0], player);
                    minion.setName(v[1]);

                    game.playMinion(minion, player, false);
                });
            } else {
                game.playMinion(card, player, false);
            }
        } else if (card.getType() === "Spell") {
            if (player.counter && player.counter.includes("Spell")) {
                player.counter.splice(player.counter.indexOf("Spell"), 1);

                rl.question("Your spell has been countered.\n")

                return;
            }

            if (card.activateDefault("cast", card) === -1) {
                this.functions.addToHand(card, player, false);
                player.mana += card.mana;
                return;
            }

            game.stats.update("spellsCast", card);

            this.getBoard()[this.plrNameToIndex(player.getName())].forEach(m => {
                m.activate("spellburst", null, () => m.hasSpellburst = false, m.plr, this, m);
            });
        } else if (card.getType() === "Weapon") {
            player.setWeapon(card);

            card.activate("battlecry", () => card.activateDefault("passive", card, ["battlecry", card]), null, card.plr, this, card);
        } else if (card.getType() === "Hero") {
            player.setHero(card);

            card.activate("battlecry", () => card.activateDefault("passive", card, ["battlecry", card]), null, card.plr, this, card);
        }

        if (player.hasPlayedCardThisTurn) {
            card.activateDefault("combo", card);
        }

        player.hasPlayedCardThisTurn = true;

        var corrupted = null;

        this.turn.hand.forEach(c => {
            if (c.length > 0 && c.keywords.includes("Corrupt")) {
                if (card.mana > c.mana) {
                    corrupted = c;

                    c.removeKeyword("Corrupt");
                    c.addKeyword("Corrupted");

                    var t = null;

                    if (c.corrupted[0] == "Minion") {
                        t = new Minion(c.corrupted[1], player);
                    } else if (c.corrupted[0] == "Spell") {
                        t = new Spell(c.corrupted[1], player);
                    } else if (c.corrupted[0] == "Weapon") {
                        t = new Weapon(c.corrupted[1], player);
                    } else if (c.corrupted[0] == "Hero") {
                        t = new Hero(c.corrupted[1], player);
                    }

                    this.functions.addToHand(t, this.turn, false);

                    return;
                }
            }
        });

        if (corrupted) {
            var n = []

            var found = false;

            this.turn.getHand().forEach(function(c) {
                if (c.displayName === corrupted.displayName && !found) {
                    found = true;
                } else {
                    n.push(c);
                }
            });

            player.setHand(n);
        }
    }

    playMinion(minion, player, summoned = true) {
        player.spellDamage = 0;

        var p = player.id;

        minion.turn = this.turns;

        if (minion.keywords.includes("Charge")) {
            minion.turn = this.turns - 1;
        }

        if (minion.keywords.includes("Rush")) {
            minion.turn = this.turns - 1;
            minion.canAttackHero = false;
        }

        this.board[p].push(minion);

        if (summoned) {
            game.stats.update("minionsSummoned", minion);
        }

        this.getBoard()[p].forEach(m => {
            m.keywords.forEach(k => {
                if (k.startsWith("Spell Damage +")) {
                    player.spellDamage += parseInt(k.split("+")[1]);
                }
            });
        });
    }

    killMinions() {
        for (var p = 0; p <= 1; p++) {
            var n = [];
            
            this.getBoard()[p].forEach(m => {
                if (m.getStats()[1] <= 0) {
                    m.activateDefault("deathrattle", m);
                }
            });

            this.getBoard()[p].forEach(m => {
                if (m.getStats()[1] <= 0) {
                    game.stats.update("minionsKilled", m);

                    if (m.keywords.includes("Reborn")) {
                        let minion = new Minion(m.getName(), this.plrIndexToPlayer(p));

                        minion.removeKeyword("Reborn");
                        minion.setStats(minion.stats[0], 1);

                        this.playMinion(minion, this.plrIndexToPlayer(p), false);

                        n.push(minion);
                    } else {
                        m.activateDefault("unpassive", m, false);
                    }
                } else {
                    n.push(m);
                }
            });

            this.board[p] = n;
        }
    }

    attackMinion(minion, target) {
        if (minion instanceof Minion && minion.frozen || minion instanceof Player && minion.frozen) return;

        var prevent = false;

        game.getBoard()[game.plrNameToIndex(game.nextTurn.getName())].forEach(m => {
            if (m.keywords.includes("Taunt") && m != target) {
                prevent = true;

                return false;
            }
        });

        if (prevent) {
            if (target instanceof Minion && target.keywords.includes("Taunt")) {}
            else return false;
        }

        if (target instanceof Minion && target.immune) return false;

        if (!isNaN(minion)) {
            if (target.keywords.includes("Divine Shield")) {
                target.removeKeyword("Divine Shield");

                return false;
            }

            target.remStats(0, minion)

            if (target.stats[1] > 0) {
                target.activateDefault("frenzy", target);
            }

            this.killMinions();

            return;
        } else if (minion.attackTimes > 0) {
            if (minion.getStats()[0] <= 0) return false;

            game.stats.update("minionsThatAttacked", minion);
            game.stats.update("minionsAttacked", minion);

            minion.remStats(0, target.stats[0])

            if (minion.stats[1] > 0) {
                minion.activateDefault("frenzy", minion);
            }

            if (target.keywords.includes("Divine Shield")) {
                target.removeKeyword("Divine Shield");

                return false;
            }

            game.stats.update("minionsAttacked", target);

            target.remStats(0, minion.stats[0])

            if (target.getStats()[1] > 0) {
                target.activateDefault("frenzy", target);
            }

            if (target.getStats()[1] < 0) {
                minion.activateDefault("overkill", minion);
            }

            if (target.getStats()[1] == 0) {
                minion.activateDefault("honorablekill", minion);
            }

            return true;
        }
    }
}

class GameStats {
    constructor() {
        this.spellsCast = [[], []];
        this.spellsCastOnMinions = [[], []];
        this.minionsPlayed = [[], []];
        this.minionsKilled = [[], []];
        this.minionsAttacked = [[], []];
        this.minionsThatAttacked = [[], []];
        this.minionsThatAttackedHero = [[], []];
        this.turnStarts = [[], []];
        this.turnEnds = [[], []];
        this.heroAttacked = [[], []];
        this.heroAttacks = [[], []];
        this.heroPowers = [[], []];
        this.fatalDamageTimes = [[], []];
        this.enemyAttacks = [[], []];
        this.restoredHealth = [[], []];
        this.cardsAddedToHand = [[], []];
        this.cardsAddedToDeck = [[], []];
        this.cardsDiscarded = [[], []];
        this.cardsDrawn = [[], []];
        this.minionsSummoned = [[], []];
        this.unspentMana = [[], []];
        this.cardsDrawnThisTurn = [[], []];
        this.heroAttackGained = [[], []];
        this.spellsThatDealtDamage = [[], []];
        this.damageTakenOnOwnTurn = [[], []];
    }

    cardUpdate(key, val) {
        game.turn.getHand().forEach(p => {
            // Infuse
            if (key == "minionsKilled" && val.plr == game.turn && p.infuse_num >= 0) {
                p.setDesc(p.desc.replace(`Infuse (${p.infuse_num})`, `Infuse (${p.infuse_num - 1})`));
                p.infuse_num -= 1;

                if (p.infuse_num == 0) {
                    p.activateDefault("infuse", p);
                    p.setDesc(p.desc.replace(`Infuse (${p.infuse_num})`, "Infused"));
                }
            }
        });

        game.getBoard().forEach(p => {
            p.forEach(m => {
                m.activateDefault("unpassive", m, true);
                m.activateDefault("passive", m, [key, val]);
            });
        });
        
        if (game.player1.weapon) {
            game.player1.weapon.activateDefault("unpassive", game.player1.weapon, true);
            game.player1.weapon.activateDefault("passive", game.player1.weapon, [key, val]);
        }
        if (game.player2.weapon) {
            game.player2.weapon.activateDefault("unpassive", game.player2.weapon, true);
            game.player2.weapon.activateDefault("passive", game.player2.weapon, [key, val]);
        }
    }

    questUpdate(quests_name, key, val, plr = game.turn) {
        plr[quests_name].forEach(s => {
            if (s["key"] == key) {
                if (!s["manual_progression"]) s["progress"][0]++;

                if ((s["value"] + this[key][game.turn.id].length - 1) == this[key][game.turn.id].length) {
                    if (s["callback"](val, game, s["turn"])) {
                        plr[quests_name].splice(plr[quests_name].indexOf(s), 1);
                    }
                }
            }
        });
    }

    update(key, val) {
        this[key][game.turn.id].push(val);

        this.cardUpdate(key, val);

        this.questUpdate("secrets",    key, val, game.nextTurn);
        this.questUpdate("sidequests", key, val);
        this.questUpdate("quests",     key, val);
        this.questUpdate("questlines", key, val);
    }
}

class Functions {
    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    shuffle(array) {
        let currentIndex = array.length, randomIndex;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    randList(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getType(card) {
        if (card.tribe) {
            return "Minion";
        } else if (card.stats) {
            return "Weapon";
        } else if (card.heropower) {
            return "Hero";
        } else {
            return "Spell";
        }
    }

    progressQuest(name, value) {
        let quest = game.turn.secrets.find(s => s["name"] == name);
        if (!quest) quest = game.turn.sidequests.find(s => s["name"] == name);
        if (!quest) quest = game.turn.quests.find(s => s["name"] == name);
        if (!quest) quest = game.turn.questlines.find(s => s["name"] == name);

        quest["progress"][0] += value;
    }

    recruit(amount = 1, mana_range = [0, 10]) {
        var array = this.shuffle(game.turn.deck)

        var times = 0;

        array.forEach(c => {
            if (c.getType() == "Minion" && c.mana >= mana_range[0] && c.mana <= mana_range[1] && times < amount) {
                game.playMinion(c, game.turn);

                times++;

                return;
            }
        });
    }

    chooseOne(prompt, options, times = 1) {
        let choices = [];

        for (var i = 0; i < times; i++) {
            var p = `\n${prompt} [`;

            options.forEach((v, i) => {
                p += `${i + 1}: ${v}, `;
            });

            p = p.slice(0, -2);
            p += "] ";

            var choice = rl.question(p);

            choices.push(parseInt(choice) - 1);
        }

        if (times === 1) {
            return choices[0];
        } else {
            return choices;
        }
    }

    spellDmg(target, damage) {
        game.stats.update("spellsThatDealtDamage", [target, damage]);

        if (target instanceof Minion) {
            game.attackMinion(this.accountForSpellDmg(damage), target);
        
            if (target.stats[1] > 0) {
                target.activateDefault("frenzy", target);
            }

            game.killMinions();
        } else if (target instanceof Player) {
            target.remHealth(this.accountForSpellDmg(damage));
        }
    }

    accountForSpellDmg(damage) {
        return damage + game.turn.spellDamage;
    }

    accountForUncollectible(cards) {
        return cards.filter(c => !c.uncollectible);
    }

    addToHand(card, player, updateStats = true) {
        if (player.getHand().length < 10) {
            player.hand.push(card);
        
            if (updateStats) game.stats.update("cardsAddedToHand", card);
        }
    }

    discover(prompt, amount = 3, flags = [], add_to_hand = true, _cards = []) {
        let values = _cards;

        if (_cards.length == 0) {
            let possible_cards = [];

            Object.entries(cards).forEach((c, _) => {
                c = c[1];
                let type = this.getType(c);

                if (type == "Spell" && c.class == "Neutral") {}
                else if (c.class === game.turn.class || c.class == "Neutral") {
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
            let stats = v.getType() == "Minion" ? ` [${v.stats[0]} / ${v.stats[1]}] ` : "";
            let desc = `(${v.desc})` || "";

            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: {${v.mana}} ${v.displayName}${stats}${desc} (${v.getType()}),\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        var choice = rl.question(p);

        if (!values[parseInt(choice) - 1]) {
            printAll(curr);

            return this.discover(prompt, amount, flags, add_to_hand, values);
        }

        var card = values[parseInt(choice) - 1];

        if (add_to_hand) {
            var c = null;
            let type = this.getType(card);

            if (type == 'Minion') c = new Minion(card.name, curr);
            if (type == 'Spell') c = new Spell(card.name, curr);
            if (type == 'Weapon') c = new Weapon(card.name, curr);
            if (type == 'Hero') c = new Hero(card.name, curr);

            this.addToHand(c, curr);

            return c;
        } else {
            return card;
        }
    }

    selectTarget(prompt, elusive = false, force = null, force_type = null) {
        if (force_type == null) {
            var t = rl.question(`\n${prompt} (type 'face' to select a hero | type 'back' to go back) `);
        } else if (force_type == "minion") {
            var t = rl.question(`\n${prompt} (type 'back' to go back) `);
        } else if (force_type == "hero") {
            if (!force) {
                var t2 = rl.question(`Do you want to select the enemy hero, or your own hero? (y: enemy, n: self) `);
        
                return (t2.startsWith("y")) ? game.nextTurn : game.turn;
            } else {
                if (force == "enemy") return game.nextTurn;
                else return game.turn;
            }
        }

        if (t.startsWith("b")) {
            var t2 = rl.question(`WARNING: Going back might cause unexpected things to happen. Do you still want to go back? (y / n) `);
            
            if (t2.startsWith("y")) {
                return false;
            }
        }

        var bn = game.getBoard()[game.nextTurn.id];
        var bo = game.getBoard()[game.turn.id];

        if (!t.startsWith("f") && !bo[parseInt(t) - 1] && !bn[parseInt(t) - 1]) {
            this.selectTarget(prompt, elusive, force, force_type);

            return false;
        }

        if (!force) {
            if (t.startsWith("f") && force_type != "minion") {
                var t2 = rl.question(`Do you want to select the enemy hero, or your own hero? (y: enemy, n: self) `);
        
                return (t2.startsWith("y")) ? game.nextTurn : game.turn;
            }
            
            if (bn.length >= parseInt(t) && bo.length >= parseInt(t)) {
                var t2 = rl.question(`Do you want to select your opponent's (${bn[parseInt(t) - 1].displayName}) or your own (${bo[parseInt(t) - 1].displayName})? (y: opponent, n: self | type 'back' to go back) `);
            
                if (t2.startsWith("b")) {
                    this.selectTarget(prompt, elusive, force, force_type);

                    return false;
                }
            } else {
                if (bn.length >= parseInt(t)) var t2 = "y";
                else if (bo.length >= parseInt(t)) var t2 = "n";
            }
        } else {
            if (t.startsWith("f") && force_type != "minion") {
                if (force == "enemy") return game.nextTurn;

                return game.turn;
            }

            t2 = (force == "enemy" ? "y" : "n");
        }

        if (t2.startsWith("y")) {
            var m = bn[parseInt(t) - 1];
        } else {
            var m = bo[parseInt(t) - 1];
        }

        if (force_type == "hero") return;

        if (m === undefined) {
            console.log("Invalid minion");
            return false;
        }

        if (m.keywords.includes("Elusive") && elusive) {
            console.log("Can't be targeted by Spells or Hero Powers");
            
            if (elusive === true) {
                game.stats.update("spellsCastOnMinions", m);
            }
            return false;
        } 

        return m;
    }

    dredge(prompt = "Choose One:") {
        // Look at the bottom three cards of the deck and put one on the top.
        var cards = game.turn.deck.slice(0, 3);

        var p = `\n${prompt}\n[`;

        if (cards.length <= 0) return;

        cards.forEach((c, i) => {
            p += `${i + 1}: ${c.displayName}, `;
        });

        p = p.slice(0, -2);

        p += "] ";

        var choice = rl.question(p);

        if (!cards[parseInt(choice) - 1]) {
            printAll(game.turn);

            return this.dredge(prompt);
        }

        var card = cards[parseInt(choice) - 1];

        game.turn.shuffleIntoDeck(card);
        game.turn.deck.splice(game.turn.deck.indexOf(card), 1);

        return card;
    }

    adapt(minion, prompt = "Choose One:") {
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

        var choice = rl.question(p);

        switch (values[parseInt(choice) - 1][0]) {
            case "Crackling Shield":
                minion.addKeyword("Divine Shield");

                break;
            case "Flaming Claws":
                minion.addStats(3, 0);

                break;
            case "Living Spores":
                minion.addDeathrattle((plr, game) => {
                    game.playMinion(new game.Minion("Plant"), plr);
                    game.playMinion(new game.Minion("Plant"), plr);
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
    }

    invoke(plr) {
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
                this.addToHand(card, plr);

                break;
            case "Rogue":
                // Add a Lackey to your hand.
                const lackey_cards = ["Ethereal Lackey", "Faceless Lackey", "Goblin Lackey", "Kobold Lackey", "Witchy Lackey"];

                this.addToHand(new Minion(game.functions.randList(lackey_cards)), plr);

                break;
            case "Shaman":
                // Summon a 2/1 Elemental with Rush.
                game.playMinion(new Minion("Windswept Elemental", plr), plr);

                break;
            case "Warlock":
                // Summon two 1/1 Imps.
                game.playMinion(new Minion("Draconic Imp", plr), plr);
                game.playMinion(new Minion("Draconic Imp", plr), plr);

                break;
            case "Warrior":
                // Give your hero +3 Attack this turn.                
                plr.addAttack(3);

                break;
            default:
                break;
        }
    }

    addSecret(plr, card, key, val, callback, manual_progression = false) {
        if (plr.secrets.length >= 3 || plr.secrets.filter(s => s.displayName == card.displayName).length > 0) {
            this.addToHand(card, plr);
            plr.mana += card.mana;
            
            return false;
        }

        plr.secrets.push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "manual_progression": manual_progression});
    }
    addSidequest(plr, card, key, val, callback, manual_progression = false) {
        if (plr.sidequests.length >= 3 || plr.sidequests.filter(s => s.displayName == card.displayName).length > 0) {
            this.addToHand(card, plr);
            plr.mana += card.mana;
            
            return false;
        }

        plr.sidequests.push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "manual_progression": manual_progression});
    }
    addQuest(plr, card, key, val, callback, manual_progression = false) {
        if (plr.quests.length > 0) {
            this.addToHand(card, plr);
            plr.mana += card.mana;
            
            return false;
        }

        plr.quests.push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "manual_progression": manual_progression});
    }
    addQuestline(plr, card, key, val, callback, manual_progression = false) {
        if (plr.questlines.length > 0) {
            this.addToHand(card, plr);
            plr.mana += card.mana;
            
            return false;
        }

        plr.questlines.push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "manual_progression": manual_progression});
    }
}

function doTurn() {
    game.killMinions();

    printName();

    curr = game.getTurn();

    if (curr !== prevPlr) {
        game.startTurn();
    }

    prevPlr = curr;

    printAll(curr);

    let input = "\nWhich card do you want to play? ";
    if (game.turns <= 2) input += "(type 'help' for further information <- This will disappear once you end your turn) ";

    var q = rl.question(input);

    if (q === "hero power") {
        curr.heroPower();

        return;
    }

    else if (q.startsWith("/give ")) {
        if (!_debug) return;

        var t = q.split(" ");

        t.shift();

        q = t.join(" ");

        let card = Object.values(game.cards).find(c => c.name.toLowerCase() == q.toLowerCase());

        let m;

        let type = game.functions.getType(card);

        if (type === "Minion") {
            m = new Minion(card.name, curr);
        } else if (type === "Spell") {
            m = new Spell(card.name, curr);
        } else if (type === "Weapon") {
            m = new Weapon(card.name, curr);
        } else if (type === "Hero") {
            m = new Hero(card.name, curr);
        }

        game.functions.addToHand(m, curr);
    } else if (q.startsWith("/class ")) {
        if (!_debug) return;

        var t = q.split(" ");

        t.shift();
        
        q = t.join(" ");

        curr.class = q;
    }

    var card = curr.getHand()[parseInt(q) - 1];
    
    if (card === undefined) {
        if (q === "end") {
            prevPlr = curr;
            game.endTurn();
        }
        else if (q === "help") {
            printName();
            rl.question("\n(In order to run a command; input the name of the command and follow further instruction.)\n\nAvailable commands:\n\nend - Ends your turn\nattack - Attack\nview - View a minion\nhero power - Use your hero power\ndetail - Get more details about opponent\nhelp - Displays this message\n\nPress enter to continue...");
        }
        else if (q == "view") {
            var minion = game.functions.selectTarget("Which minion do you want to view?", false, null, "minion");

            if (minion === undefined) return;

            viewMinion(minion);
        }
        else if (q == "detail") {
            printName();
            printAll(curr, true);

            rl.question("Press enter to continue...");

            printName();
            printAll(curr);
        }
        else if (q == "/eval") {
            if (!_debug) return;

            eval(rl.question("\nWhat do you want to evaluate? "));
        }
        else if (q === "attack") {
            var attacker = game.functions.selectTarget("Which minion do you want to attack with?", false, "self");
            if (attacker === false) return;
            if (attacker.frozen) return;

            var target = game.functions.selectTarget("Which minion do you want to attack?", false, "enemy");
            if (target === false) return;

            var prevent = false;

            game.getBoard()[game.plrNameToIndex(game.nextTurn.getName())].forEach(m => {
                if (m.keywords.includes("Taunt") && m != target) {
                    prevent = true;
    
                    return;
                }
            });
    
            if (prevent) {
                if (target instanceof Minion && target.keywords.includes("Taunt")) {}
                else return;
            }

            p1 = game.plrNameToIndex(curr.getName());
            p2 = p1

            p1 = (p1 === 0) ? 1 : 0;

            if (target instanceof Player) {
                if (game.nextTurn.immune) return;
                if (attacker instanceof Minion && !attacker.canAttackHero) return;

                if (attacker instanceof Player) {

                    game.stats.update("enemyAttacks", "hero");
                    game.stats.update("heroAttacks", [attacker, target]);
                    game.stats.update("heroAttacked", [attacker, target, game.turns]);

                    game.nextTurn.remHealth(curr.attack);
    
                    if (curr.weapon && curr.weapon.attackTimes > 0 && curr.weapon.stats[0]) {
                        curr.weapon.remStats(0, 1);
                        curr.weapon.attackTimes -= 1;
    
                        curr.weapon.activateDefault("onattack", curr.weapon);
                    }
    
                    curr.attack = 0;
        
                    return;
                }

                if (attacker === undefined) {
                    console.log("Invalid minion");
                    return;
                }

                if (attacker.turn == game.getTurns()) {
                    console.log("That minion cannot attack this turn!");
                    return;
                }

                if (attacker.attackTimes == 0) {
                    console.log("That minion has already attacked this turn!");
                    return;
                }

                game.stats.update("minionsThatAttacked", [attacker, target]);
                game.stats.update("minionsThatAttackedHero", [attacker, target]);
                game.stats.update("enemyAttacks", [attacker, target]);
                game.stats.update("heroAttacked", [attacker, target, game.turns]);

                if (attacker.keywords.includes("Stealth")) {
                    attacker.removeKeyword("Stealth");
                }

                attacker.attackTimes -= 1;

                game.nextTurn.remHealth(attacker.stats[0]);

                if (attacker.keywords.includes("Lifesteal")) {
                    curr.addHealth(attacker.stats[0]);
                }

                return;
            } else if (attacker instanceof Player) {
                if (target instanceof Minion && target.immune) return;
                if (target instanceof Minion && target.keywords.includes("Stealth")) return;

                if (target === undefined) {
                    console.log("Invalid minion");
                    return;
                }

                game.stats.update("minionsAttacked", target);

                game.attackMinion(curr.attack, target);
                curr.remHealth(target.stats[0]);

                if (target.stats[1] > 0) {
                    target.activateDefault("frenzy", target);
                }

                if (curr.weapon && curr.weapon.attackTimes > 0 && curr.weapon.stats[0]) {
                    curr.weapon.remStats(0, 1);
                    curr.weapon.attackTimes -= 1;

                    curr.weapon.activateDefault("onattack", curr.weapon);

                    if (curr.weapon.keywords.includes("Poisonous")) {
                        target.setStats(target.stats[0], 0);
                    }
                }

                curr.attack = 0;

                game.killMinions();

                return;
            }

            if (target === undefined || attacker === undefined) {
                console.log("Invalid minion");
                return;
            }

            if (attacker.turn == game.getTurns()) {
                console.log("That minion has cannot attack this turn!");
                return;
            }
            
            if (target.keywords.includes("Stealth")) return;

            if (game.attackMinion(attacker, target)) {
                attacker.attackTimes -= 1;

                if (attacker.keywords.includes("Stealth")) {
                    attacker.removeKeyword("Stealth");
                }

                attacker.activateDefault("onattack", attacker);

                if (attacker.keywords.includes("Lifesteal")) {
                    curr.addHealth(attacker.stats[0]);
                }

                if (attacker.keywords.includes("Poisonous")) {
                    target.setStats(target.stats[0], 0);
                }

                if (target.keywords.includes("Poisonous")) {
                    attacker.setStats(attacker.stats[0], 0);
                }

                game.killMinions();
            }

            return;

        }
        
        else {
            console.log("Invalid card.");
        }

        return;
    }

    if (q == curr.hand.length || q == 1) {
        card.activateDefault("outcast", card);
    }

    game.playCard(card, curr);
}

function printName() {
    process.stdout.write('\033c');

    return;

    console.log("|-----------------------------|");
    console.log("|       HEARTHSTONE.JS        |");
    console.log("|-----------------------------|");
}

function printAll(curr, detailed = false) {
    console.log(`Mana: ${curr.getMana()} / ${curr.getMaxMana()} | Opponent's Mana: ${game.nextTurn.getMana()} / ${game.nextTurn.getMaxMana()}`);
    console.log(`Health: ${curr.health} + ${curr.armor} / ${curr.maxHealth} | Opponent's Health: ${game.nextTurn.health} + ${game.nextTurn.armor} / ${game.nextTurn.maxHealth}`);

    wpnstr = "";
    if (curr.attack > 0) wpnstr += `Attack: ${curr.attack}`;
    if (wpnstr && curr.weapon) wpnstr += " | ";
    if (curr.weapon) wpnstr += `Weapon: ${curr.weapon.displayName} (${curr.weapon.getStats().join(' / ')})`;
    if (curr.weapon && game.nextTurn.weapon) wpnstr += " | ";
    if (game.nextTurn.weapon) wpnstr += `Opponent's Weapon: ${game.nextTurn.weapon.displayName} (${game.nextTurn.weapon.getStats().join(' / ')})`;

    if (wpnstr) console.log(wpnstr);

    if (curr.secrets.length > 0)
        console.log(`Secrets: ${curr.secrets.map(x => x["name"]).join(', ')}`);
    if (curr.sidequests.length > 0)
        console.log(`Sidequests: ${curr.sidequests.map(x => x["name"] + " (" + x["progress"][0] + " / " + x["progress"][1] + ")").join(', ')}`);
    if (curr.quests.length > 0)
        console.log(`Quest: ${curr.quests[0]["name"] + " (" + curr.quests[0]["progress"][0] + " / " + curr.quests[0]["progress"][1] + ")"}`);
    if (curr.questlines.length > 0)
        console.log(`Questline: ${curr.questlines[0]["name"] + " (" + curr.questlines[0]["progress"][0] + " / " + curr.questlines[0]["progress"][1] + ")"}\n`);
        
    console.log(`Deck Size: ${curr.getDeck().length} | Opponent's Deck Size: ${game.nextTurn.getDeck().length}`);

    if (detailed) {
        console.log("-------------------------------");

        if (game.nextTurn.secrets.length > 0)
            console.log(`Opponent's Secrets: ${game.nextTurn.secrets.length + 1}`);
        if (game.nextTurn.sidequests.length > 0)
            console.log(`Opponent's Sidequests: ${game.nextTurn.sidequests.map(x => x["name"] + " (" + x["progress"][0] + " / " + x["progress"][1] + ")").join(', ')}`);
        if (game.nextTurn.quests.length > 0)
            console.log(`Opponent's Quest: ${game.nextTurn.quests[0]["name"] + " (" + game.nextTurn.quests[0]["progress"][0] + " / " + game.nextTurn.quests[0]["progress"][1] + ")"}`);
        if (game.nextTurn.questlines.length > 0)
            console.log(`Opponent's Questline: ${game.nextTurn.questlines[0]["name"] + " (" + game.nextTurn.questlines[0]["progress"][0] + " / " + game.nextTurn.questlines[0]["progress"][1] + ")"}\n`);

        console.log(`Opponent's Hand Size: ${game.nextTurn.getHand().length}`);
    }

    console.log("\n--- Board ---");
    game.getBoard().forEach((_, i) => {
        if (i == curr.id) {
            var t = `--- You ---`
        } else {
            var t = "--- Opponent ---"
        }

        console.log(t) // This is not for debugging, do not comment out

        if (game.getBoard()[i].length == 0) {
            console.log("(None)");
        } else {
            game.getBoard()[i].forEach((m, n) => {
                var keywords = m.getKeywords().length > 0 ? ` {${m.getKeywords().join(", ")}}` : "";
                var frozen = m.frozen && !m.dormant ? " (Frozen)" : "";
                var immune = m.immune && !m.dormant ? " (Immune)" : "";
                var dormant = m.dormant ? " (Dormant)" : "";

                console.log(`[${n + 1}] ${m.displayName} (${m.getStats().join(" / ")})${keywords}${frozen}${immune}${dormant}`);
            });
        }
    });
    console.log("-------------")

    _class = curr.hero == "" ? curr.class : curr.hero.getName();
    if (detailed) _class += ` | HP: ${curr.hero_power != "hero" ? curr.hero_power : curr.hero.getName()}`;

    console.log(`\n--- ${curr.getName()} (${_class})'s Hand ---`);
    console.log("([id] {cost} Name [attack / health] (type))\n");

    curr.getHand().forEach((card, i) => {
        if (card.getType() === "Minion" || card.getType() === "Weapon") {
            var desc = card.getDesc().length > 0 ? ` (${card.getDesc()}) ` : " ";
            console.log(`[${i + 1}] {${card.getMana()}} ${card.displayName} [${card.getStats().join(' / ')}]${desc}(${card.getType()})`);
        } else {
            var desc = card.getDesc().length > 0 ? ` (${card.getDesc()}) ` : " ";
            console.log(`[${i + 1}] {${card.getMana()}} ${card.displayName}${desc}(${card.getType()})`);
        }
    });
    console.log("------------")
}

function viewMinion(minion, detailed = false) {
    console.log(`{${minion.getMana()}} ${minion.displayName} [${minion.blueprint.stats.join(' / ')}]\n`);
    if (minion.getDesc()) console.log(minion.getDesc() + "\n");
    console.log("Tribe: " + minion.getTribe());
    console.log("Class: " + minion.getClass());

    const frozen = minion.frozen && !minion.dormant;
    const immune = minion.immune && !minion.immune;
    const dormant = minion.dormant && !minion.dormant;

    console.log("Is Frozen: " + frozen);
    console.log("Is Immune: " + immune);
    console.log("Is Dormant: " + dormant);
    if (detailed) {
        console.log("Is Corrupted: " + minion.corrupted);
        console.log("Rarity: " + minion.getRarity());
        console.log("Set: " + minion.getSet());
        console.log("Turn played: " + minion.turn);
    }

    let q = rl.question("\nDo you want to view more info, or do you want to go back? [more / back] ");

    if (q.toLowerCase().startsWith("m")) {
        viewMinion(minion, true)
    } else {
        return;
    }
}

let game;

if (!_debug) {
    printName();

    const name1 = rl.question("\nPlayer 1, what is your name? ");
    const name2 = rl.question("Player 2, what is your name? ");

    printName();
    const passcode1 = rl.question(`\nPlayer 1 (${name1}), please enter your passcode: `, {hideEchoBack: true});
    printName();
    const passcode2 = rl.question(`\nPlayer 2 (${name2}), please enter your passcode: `, {hideEchoBack: true});

    const player1 = new Player(name1);
    const player2 = new Player(name2);

    player1.passcode = crypto.createHash('sha256').update(passcode1).digest('hex');
    player2.passcode = crypto.createHash('sha256').update(passcode2).digest('hex');

    game = new Game(player1, player2, new Functions());
} else {
    game = new Game(new Player("Isak"), new Player("Sondre"), new Functions());
}

function createVarFromFoundType(name, curr) {
    let card = Object.values(game.cards).find(c => c.name.toLowerCase() == name.toLowerCase());

    let m;

    let type = game.functions.getType(card);

    if (type === "Minion") {
        m = new Minion(card.name, curr);
    } else if (type === "Spell") {
        m = new Spell(card.name, curr);
    } else if (type === "Weapon") {
        m = new Weapon(card.name, curr);
    } else if (type === "Hero") {
        m = new Hero(card.name, curr);
    }

    return m;
}

function importDeck(code, plr) {
    // The code is base64 encoded, so we need to decode it
    code = Buffer.from(code, 'base64').toString('ascii');
    let deck = code.split(", ");
    let _deck = [];

    // Find all cards with "x2" in front of them, and remove it and add the card twice
    for (let i = 0; i < deck.length; i++) {
        if (deck[i].startsWith("x2 ")) {
            let m1 = createVarFromFoundType(deck[i].substring(3), plr);
            let m2 = createVarFromFoundType(deck[i].substring(3), plr);

            _deck.push(m1, m2);
        } else {
            let m = createVarFromFoundType(deck[i], plr);

            _deck.push(m);
        }
    }

    game.functions.shuffle(_deck);

    return _deck;
}

printName();

const deckcode1 = rl.question("\nPlayer 1, please type in your deckcode (Leave this empty for a test deck): ");
printName();
const deckcode2 = rl.question("\nPlayer 2, please type in your deckcode (Leave this empty for a test deck): ");

if (deckcode1.length > 0) {
    game.player1.deck = importDeck(deckcode1, game.player1);
} else {
    while (game.player1.getDeck().length < 30) game.player1.deck.push(new Minion("Sheep", game.player1));
}
if (deckcode2.length > 0) {
    game.player2.deck = importDeck(deckcode2, game.player2);
} else {
    while (game.player2.getDeck().length < 30) game.player2.deck.push(new Minion("Sheep", game.player2));
}

game.startGame();

var running = true;

var prevPlr = null;

while (running) {
    doTurn();
}