const fs = require('fs');
const { exit } = require('process');
const rl = require('readline-sync');
const crypto = require('crypto');

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

class Minion {
    constructor(name, plr) {
        this.blueprint = cards[name];

        this.name = name;
        this.type = "Minion";
        this.stats = this.blueprint.stats;
        this.desc = this.blueprint.desc;
        this.mana = this.blueprint.mana;
        this.tribe = this.blueprint.tribe;
        this.class = this.blueprint.class;
        this.rarity = this.blueprint.rarity;
        this.set = this.blueprint.set;
        this.keywords = this.blueprint.keywords || [];
        this.oghealth = this.stats[1];
        this.corrupted = this.blueprint.corrupted || false;
        this.colossal = this.blueprint.colossal || false;
        this.dormant = this.blueprint.dormant || false;
        this.frozen = false;
        this.immune = false;
        this.echo = false;
        this.canAttackHero = true;
        this.attackTimes = 1;
        this.plr = plr;
        this.stealthDuration = 0;
        this.uncollectible = this.blueprint.uncollectible || false;

        this.turn = null;

        this.hasBattlecry = this.blueprint.battlecry != undefined;
        this.hasDeathrattle = this.blueprint.deathrattle != undefined;
        this.hasInspire = this.blueprint.inspire != undefined;
        this.hasEndOfTurn = this.blueprint.endofturn != undefined;
        this.hasStartOfTurn = this.blueprint.startofturn != undefined;
        this.hasCombo = this.blueprint.combo != undefined;
        this.hasOnAttack = this.blueprint.onattack != undefined;
        this.hasOutcast = this.blueprint.outcast != undefined;
        this.hasStartOfGame = this.blueprint.startofgame != undefined;
        this.hasOverkill = this.blueprint.overkill != undefined;
        this.hasFrenzy = this.blueprint.frenzy != undefined;
        this.hasHonorableKill = this.blueprint.honorablekill != undefined;
        this.hasSpellburst = this.blueprint.spellburst != undefined;

        this.deathrattles = this.hasDeathrattle ? [this.blueprint.deathrattle] : [];
    }

    getName() {
        return this.name;
    }

    getType() {
        return this.type;
    }

    getStats() {
        return this.stats;
    }

    getAttack() {
        return this.stats[0];
    }

    getHealth() {
        return this.stats[1];
    }

    getDesc() {
        return this.desc;
    }

    getCost() {
        return this.mana;
    }

    getTribe() {
        return this.tribe;
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

    getBlueprint() {
        return this.blueprint;
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

    setTribe(tribe) {
        this.tribe = tribe;
    }

    setClass(c) {
        this.class = c;
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

    addKeyword(keyword) {
        this.keywords.push(keyword);

        if (this.keywords.includes("Charge")) {
            this.turn = game.turns - 1;
        }

        if (this.keywords.includes("Rush")) {
            this.turn = game.turns - 1;
            this.canAttackHero = false;
        }
    }

    removeKeyword(keyword) {
        this.keywords = this.keywords.filter(k => k != keyword);
    }

    addStats(attack = 0, health = 0, restore = false) {
        this.stats = [this.stats[0] + attack, this.stats[1] + health];

        if (restore) {
            if (this.stats[1] > this.oghealth) {
                game.stats.update("restoredHealth", this.oghealth);

                this.stats = [this.stats[0], this.oghealth];
            } else {
                game.stats.update("restoredHealth", health);
            }
        }
    }

    remStats(attack = 0, health = 0) {
        this.stats = [this.stats[0] - attack, this.stats[1] - health];
    }

    setStats(attack = this.stats[0], health = this.stats[1]) {
        this.stats = [attack, health];
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

    addHealth(amount) {
        this.stats[1] += amount;
        
        if (this.stats[1] > this.oghealth) {
            this.stats[1] = this.oghealth;
        }
    }

    addAttack(amount) {
        this.stats[0] += amount;
    }

    remHealth(amount) {
        this.stats[1] -= amount;
    }

    remAttack(amount) {
        this.stats[0] -= amount;
    }

    setDeathrattle(deathrattle) {
        this.hasDeathrattle = true;
        this.deathrattles = deathrattle;
    }

    setEndOfTurn(endofturn) {
        this.hasEndOfTurn = true;
        this.endofturn = endofturn;
    }

    setStartOfTurn(startofturn) {
        this.hasStartOfTurn = true;
        this.startofturn = startofturn;
    }

    addDeathrattle(deathrattle) {
        this.hasDeathrattle = true;
        this.deathrattles.push(deathrattle);
    }

    silence() {
        this.name = this.blueprint.name;
        this.type = this.blueprint.type;
        this.stats = this.blueprint.stats;
        this.desc = this.blueprint.desc;
        this.mana = this.blueprint.mana;
        this.tribe = this.blueprint.tribe;
        this.class = this.blueprint.class;
        this.rarity = this.blueprint.rarity;
        this.set = this.blueprint.set;

        this.keywords = [];

        this.deathrattles = [];

        this.hasDeathrattle = false;
        this.hasEndOfTurn = false;
        this.hasStartOfTurn = false;
        this.hasInspire = false;
        this.hasOnAttack = false;
        this.hasOverkill = false;
        this.hasFrenzy = false;
        this.hasHonorableKill = false;
        this.hasSpellburst = false;
    }

    activateBattlecry(game) {
        if (!this.hasBattlecry) return false;
        this.blueprint.battlecry(this.plr, game, this);
    }

    activateDeathrattle(game) {
        if (!this.hasDeathrattle) return false;
        this.deathrattles.forEach(deathrattle => {
            deathrattle(this.plr, game, this);
        });
    }

    activateInspire(game) {
        if (!this.hasInspire) return false;
        this.blueprint.inspire(this.plr, game, this);
    }

    activateEndOfTurn(game) {
        if (!this.hasEndOfTurn) return false;
        this.blueprint.endofturn(this.plr, game, this);
    }

    activateStartOfTurn(game) {
        if (!this.hasStartOfTurn) return false;
        this.blueprint.startofturn(this.plr, game, this);
    }

    activateCombo(game) {
        if (!this.hasCombo) return false;
        this.blueprint.combo(this.plr, game, this);
    }

    activateOnAttack(game) {
        if (!this.hasOnAttack) return false;
        this.blueprint.onAttack(this.plr, game, this);
    }

    activateOutcast(game) {
        if (!this.hasOutcast) return false;
        this.blueprint.outcast(this.plr, game, this);
    }

    activateStartOfGame(game) {
        if (!this.hasStartOfGame) return false;
        this.blueprint.startofgame(this.plr, game, this);
    }

    activateOverkill(game) {
        if (!this.hasOverkill) return false;
        this.blueprint.overkill(this.plr, game, this);
    }

    activateFrenzy(game) {
        if (!this.hasFrenzy) return false;
        this.blueprint.frenzy(this.plr, game, this);
    }

    activateHonorableKill(game) {
        if (!this.hasHonorableKill) return false;
        this.blueprint.honorablekill(this.plr, game, this);
    }

    activateSpellburst(game) {
        if (!this.hasSpellburst) return false;
        this.blueprint.spellburst(this.plr, game, this);
        this.hasSpellburst = false;
    }

}

class Spell {
    constructor(name, plr) {
        this.blueprint = cards[name];

        this.name = name;
        this.type = this.blueprint.type;
        this.desc = this.blueprint.desc;
        this.mana = this.blueprint.mana;
        this.class = this.blueprint.class;
        this.rarity = this.blueprint.rarity;
        this.set = this.blueprint.set;
        this.keywords = this.blueprint.keywords || [];
        this.corrupted = this.blueprint.corrupted || false;
        this.plr = plr;
        this.uncollectible = this.blueprint.uncollectible || false;

        this.echo = false;

        this.hasCast = this.blueprint.cast != undefined;
        this.hasCombo = this.blueprint.combo != undefined;
        this.hasOutcast = this.blueprint.outcast != undefined;
        this.hasCastOnDraw = this.blueprint.castondraw != undefined;
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

    getCost() {
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

    getBlueprint() {
        return this.blueprint;
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

    setClass(c) {
        this.class = c;
    }

    setRarity(rarity) {
        this.rarity = rarity;
    }

    setSet(set) {
        this.set = set;
    }

    addKeyword(keyword) {
        this.keywords.push(keyword);
    }

    removeKeyword(keyword) {
        this.keywords = this.keywords.filter(k => k != keyword);
    }

    activateCast(game) {
        if (!this.hasCast) return false;
        this.blueprint.cast(this.plr, game, this);
    }

    activateCombo(game) {
        if (!this.hasCombo) return false;
        this.blueprint.combo(this.plr, game, this);
    }

    activateOutcast(game) {
        if (!this.hasOutcast) return false;
        this.blueprint.outcast(this.plr, game, this);
    }

    activateCastOnDraw(game) {
        if (!this.hasCastOnDraw) return false;
        this.blueprint.castondraw(this.plr, game, this);
        return true;
    }

}

class Weapon {
    constructor(name, plr) {
        this.blueprint = cards[name];

        this.name = name;
        this.type = this.blueprint.type;
        this.desc = this.blueprint.desc;
        this.mana = this.blueprint.mana;
        this.class = this.blueprint.class;
        this.rarity = this.blueprint.rarity;
        this.set = this.blueprint.set;
        this.stats = this.blueprint.stats;
        this.keywords = this.blueprint.keywords || [];
        this.corrupted = this.blueprint.corrupted || false;
        this.attackTimes = 1;
        this.plr = plr;
        this.uncollectible = this.blueprint.uncollectible || false;

        this.echo = false;

        this.hasBattlecry = this.blueprint.battlecry != undefined;
        this.hasDeathrattle = this.blueprint.deathrattle != undefined;
        this.hasOnAttack = this.blueprint.onattack != undefined;
        this.hasCombo = this.blueprint.combo != undefined;
        this.hasOutcast = this.blueprint.outcast != undefined;

        this.deathrattles = this.hasDeathrattle ? [this.blueprint.deathrattle] : [];
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

    getCost() {
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

    getStats() {
        return this.stats;
    }

    getBlueprint() {
        return this.blueprint;
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

    setClass(c) {
        this.class = c;
    }

    setRarity(rarity) {
        this.rarity = rarity;
    }

    setSet(set) {
        this.set = set;
    }

    addKeyword(keyword) {
        this.keywords.push(keyword);
    }

    removeKeyword(keyword) {
        this.keywords = this.keywords.filter(k => k != keyword);
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

    addHealth(amount) {
        this.stats[1] += amount;
    }

    addAttack(amount) {
        this.stats[0] += amount;
    }

    remHealth(amount) {
        this.stats[1] -= amount;
    }

    remAttack(amount) {
        this.stats[0] -= amount;
    }

    addDeathrattle(deathrattle) {
        this.hasDeathrattle = true;
        this.deathrattles.push(deathrattle);
    }

    activateBattlecry(game) {
        if (!this.hasBattlecry) return false;
        this.blueprint.battlecry(this.plr, game, this);
    }

    activateDeathrattle(game) {
        if (!this.hasDeathrattle) return false;
        this.deathrattles.forEach(deathrattle => {
            deathrattle(this.plr, game, this);
        });
    }

    activateOnAttack(game) {
        if (!this.hasOnAttack) return false;
        this.blueprint.onattack(this.plr, game, this);
    }

    activateCombo(game) {
        if (!this.hasCombo) return false;
        this.blueprint.combo(this.plr, game, this);
    }

    activateOutcast(game) {
        if (!this.hasOutcast) return false;
        this.blueprint.outcast(this.plr, game, this);
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
        this.game = null;
        this.health = 30;
        this.maxHealth = this.health;
        this.attack = 0;
        this.armor = 0;
        this.class = "Mage";
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

        if (maxMana > 10) maxMana = 10;
    }

    setGame(game) {
        this.game = game;
    }

    setWeapon(weapon) {
        this.weapon = weapon;

        this.attack += weapon.getStats()[0];
    }

    addOverload(amount) {
        this.overload += amount;
    }

    addHealth(amount) {
        this.health += amount;

        if (this.health > this.maxHealth) this.health = this.maxHealth;
    }

    remHealth(amount) {
        var a = amount;

        while (this.armor > 0) {
            a--;
            this.armor--;
        }

        this.health -= a;

        if (this.health <= 0) {
            this.game.stats.update("fatalDamageTimes", 1);

            this.game.endGame(game.nextTurn);
        }
    }

    drawCard() {
        //this.game.functions.shuffle(this.deck); // Removed incase this messes with Lorekeeper Polkelt

        if (this.deck.length <= 0) {
            this.fatigue++;

            this.remHealth(this.fatigue);
            
            return;
        }

        var card = this.deck.pop()

        if (card.type == "Spell") {
            if (card.activateCastOnDraw(this.game)) {
                return null;
            }
        }

        if (this.getHand().length < 10) this.hand.push(card);

        game.stats.update("cardsDrawn", card);
        game.stats.update("cardsDrawnThisTurn", card);

        return card;
    }

    heroPower() {
        if (this.class == "Demon Hunter") this.heroPowerCost = 1;

        if (this.getMana() < this.heroPowerCost || !this.canUseHeroPower) return false;

        if (this.class == "Demon Hunter") {
            game.stats.update("heroAttackGained", 1);

            this.attack += 1;
        }
        else if (this.class == "Druid") {
            game.stats.update("heroAttackGained", 1);

            this.attack += 1;
            this.armor += 1;
        }
        else if (this.class == "Hunter") {
            this.game.nextTurn.remHealth(2);
        }
        else if (this.class == "Mage") {
            var t = this.game.functions.selectTarget("Deal 1 damage.", "heropower");

            if (t == false) return false;

            if (t instanceof Player) {
                t.remHealth(1);
            } else {
                game.attackMinion(1, t);
            }
        }
        else if (this.class == "Paladin") {
            let minion = new Minion("Silver Hand Recruit", this);

            game.stats.update("minionsSummoned", minion);

            game.playMinion(minion, this);
        }
        else if (this.class == "Priest") {
            var t = this.game.functions.selectTarget("Restore 2 health.", "heropower");

            if (t == false) return false;

            t.addHealth(2);
        }
        else if (this.class == "Rogue") {
            this.weapon = new Weapon("Wicked Knife", this);
        }
        else if (this.class == "Shaman") {
            const totem_cards = ["Healing Totem", "Searing Totem", "Stoneclaw Totem", "Strength Totem"];

            game.getBoard()[this.id].forEach(m => {
                if (totem_cards.includes(m.name)) {
                    totem_cards.splice(totem_cards.indexOf(m.name), 1);
                }
            });

            if (totem_cards.length == 0) {
                return;
            }

            let minion = new Minion(game.functions.randList(totem_cards), this);

            game.stats.update("minionsSummoned", minion);

            game.playMinion(minion, this);
        }
        else if (this.class == "Warlock") {
            game.stats.update("damageTakenOnOwnTurn", 2);

            this.remHealth(2);

            this.drawCard();
        }
        else if (this.class == "Warrior") {
            this.armor += 2;
        }

        this.game.getBoard()[this.id].forEach(m => {
            m.activateInspire(this.game);
        });

        this.setMana(this.getMana() - this.heroPowerCost);

        game.stats.update("heroPowers", this.class);

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

    startGame() {
        for (let i = 0; i < 3; i++) {
            this.player1.drawCard()
        }

        for (let i = 0; i < 4; i++) {
            this.player2.drawCard();
        }
        this.player2.hand.push(new Spell("The Coin", this.player2));

        this.player1.setMaxMana(1);
        this.player1.setMana(1);

        this.turns += 1;

        this.player1.deck.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateStartOfGame(this);
            }
        });
        this.player2.deck.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateStartOfGame(this);
            }
        });

        this.player1.hand.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateStartOfGame(this);
            }
        });
        this.player2.hand.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateStartOfGame(this);
            }
        });
    }

    endGame(p) {
        console.clear();

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
            m.activateEndOfTurn(this);
        });

        let _c = this.player1.hand.filter(c => !c.echo)
        this.player1.setHand(_c);

        _c = this.player2.hand.filter(c => !c.echo)
        this.player2.setHand(_c);

        this.turn.attack = 0;
        this.turn = this.nextTurn;

        this.turn.setMaxMana(this.turn.getMaxMana() + 1);
        if (this.turn.maxMana > 10) this.turn.maxMana = 10;
        this.turn.setMana(this.turn.getMaxMana());

        this.nextTurn = (this.nextTurn === this.player1) ? this.player2 : this.player1;

        this.turns += 1;
    }

    startTurn() {
        game.stats.update("turnStarts", game.turns);

        // Clear console
        console.clear();

        printName()

        const passcode = rl.question(`\nPlayer ${this.turn.id + 1} (${this.turn.name}), please enter your passcode: `, {hideEchoBack: true});

        if (this.turn.passcode != crypto.createHash('sha256').update(passcode).digest('hex')) {
            rl.question("Incorrect passcode!\n");
            this.startTurn();
            return;
        }

        console.clear();

        printName()

        if (this.turn.weapon !== null) {
            this.turn.attack += this.turn.weapon.stats[0];
        }

        this.turn.mana -= this.turn.overload;
        this.turn.overload = 0;

        this.getBoard()[this.plrNameToIndex(this.turn.getName())].forEach(m => {
            m.activateStartOfTurn(this);
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

                    m.activateBattlecry(this);
                }

                m.turn = game.turns;
            } else {
                m.frozen = false;
            }
        });

        if (this.turn.weapon) this.turn.weapon.resetAttackTimes();

        this.turn.drawCard();

        this.turn.canUseHeroPower = true;
    }

    playCard(card, player) {
        if (player.getMana() < card.getCost()) {
            return false;
        }

        if (card.keywords.includes("Tradeable")) {
            var q = rl.question(`Would you like to trade ${card.getName()} for a random card in your deck? (y: trade / n: play) `);

            if (q.startsWith("y")) {
                if (player.getMana() < 1) {
                    return false;
                }

                player.setMana(player.getMana() - 1);

                player.deck.push(card);

                var n = []

                var found = false;

                player.getHand().forEach(function(c) {
                    if (c.name === card.name && !found) {
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

        player.setMana(player.getMana() - card.getCost());
        
        var n = []

        var found = false;

        player.getHand().forEach(function(c) {
            if (c.name === card.name && !found) {
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
            game.stats.update("minionsPlayed", [card, game.turns]);

            if (card.colossal) {
                card.colossal.forEach((v, i) => {
                    let minion = new Minion(v[0], player);
                    minion.setName(v[1]);

                    game.playMinion(minion, player);
                });
            } else {
                game.playMinion(card, player);
            }

            if (card.dormant) {
                card.frozen = true;
                card.immune = true;
                card.dormant = card.dormant + game.turns;
            } else {
                card.activateBattlecry(this);
            }
        } else if (card.getType() === "Spell") {
            if (player.counter && player.counter.includes("Spell")) {
                player.counter.splice(player.counter.indexOf("Spell"), 1);

                rl.question("Your spell has been countered.\n")

                return;
            }

            game.stats.update("spellsCast", card);

            card.activateCast(this);

            this.getBoard()[this.plrNameToIndex(player.getName())].forEach(m => {
                m.activateSpellburst(this);
            });
        } else if (card.getType() === "Weapon") {
            player.setWeapon(card);

            card.activateBattlecry(this);
        }

        if (player.hasPlayedCardThisTurn) {
            card.activateCombo(this);
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
                    }

                    this.turn.hand.push(t);

                    return;
                }
            }
        });

        if (corrupted) {
            var n = []

            var found = false;

            this.turn.getHand().forEach(function(c) {
                if (c.name === corrupted.name && !found) {
                    found = true;
                } else {
                    n.push(c);
                }
            });

            player.setHand(n);
        }
    }

    playMinion(minion, player) {
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

        if (player.counter && player.counter.includes("Minion")) {
            player.counter.splice(player.counter.indexOf("Minion"), 1);

            rl.question("Your minion has been countered.\n")

            return;
        }

        this.board[p].push(minion);

        this.getBoard()[p].forEach(m => {
            m.keywords.forEach(k => {
                if (k.startsWith("Spell Damage +")) {
                    player.spellDamage += parseInt(k.split("+")[1]);
                }
            });
        });
    }

    killMinions() {
        for (var p = 0; p < 2; p++) {
            var n = [];
            
            this.getBoard()[p].forEach(m => {
                if (m.getHealth() <= 0) {
                    m.activateDeathrattle(this);
                }
            });

            this.getBoard()[p].forEach(m => {
                if (m.getHealth() <= 0) {
                    game.stats.update("minionsKilled", m);

                    if (m.keywords.includes("Reborn")) {
                        m.removeKeyword("Reborn");

                        m.setStats(m.stats[0], 1)

                        n.push(m);
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
                target.activateFrenzy(this);
            }

            this.killMinions();

            return;
        } else if (minion.attackTimes > 0) {
            if (minion.getStats()[0] <= 0) return false;

            game.stats.update("minionsThatAttacked", minion);
            game.stats.update("minionsAttacked", target);

            minion.remStats(0, target.stats[0])

            if (minion.stats[1] > 0) {
                minion.activateFrenzy(this);
            }

            if (target.keywords.includes("Divine Shield")) {
                target.removeKeyword("Divine Shield");

                return false;
            }

            target.remStats(0, minion.stats[0])

            if (target.getStats()[1] > 0) {
                target.activateFrenzy(this);
            }

            if (target.getStats()[1] < 0) {
                minion.activateOverkill(this);
            }

            if (target.getStats()[1] == 0) {
                minion.activateHonorableKill(this);
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
        this.cardsDiscarded = [[], []];
        this.cardsDrawn = [[], []];
        this.minionsSummoned = [[], []];
        this.unspentMana = [[], []];
        this.cardsDrawnThisTurn = [[], []];
        this.heroAttackGained = [[], []];
        this.spellsThatDealtDamage = [[], []];
        this.damageTakenOnOwnTurn = [[], []];
    }

    update(key, val) {
        this[key][game.turn.id].push(val);

        game.nextTurn.secrets.forEach(s => {
            if (s["key"] == key) {
                if (!s["manual_progression"]) s["progress"][0]++;

                if ((s["value"] + this[key][game.turn.id].length - 1) == this[key][game.turn.id].length) {
                    if (s["callback"](val, game, s["turn"])) {
                        game.nextTurn.secrets.splice(game.nextTurn.secrets.indexOf(s), 1);
                    }
                }
            }
        });
        game.turn.sidequests.forEach(s => {
            if (s["key"] == key) {
                if (!s["manual_progression"]) s["progress"][0]++;

                if ((s["value"] + this[key][game.turn.id].length - 1) == this[key][game.turn.id].length) {
                    if (s["callback"](val, game, s["turn"])) {
                        game.turn.sidequests.splice(game.turn.sidequests.indexOf(s), 1);
                    }
                }
            }
        });
        game.turn.quests.forEach(s => {
            if (s["key"] == key) {
                if (!s["manual_progression"]) s["progress"][0]++;

                if ((s["value"] + this[key][game.turn.id].length - 1) == this[key][game.turn.id].length) {
                    if (s["callback"](val, game, s["turn"])) {
                        game.turn.quests.splice(game.turn.quests.indexOf(s), 1);
                    }
                }
            }
        });
        game.turn.questlines.forEach(s => {
            if (s["key"] == key) {
                if (!s["manual_progression"]) s["progress"][0]++;

                if (s["key"] == key && (s["value"] + this[key][game.turn.id].length - 1) == this[key][game.turn.id].length) {
                    if (s["callback"](val, game, s["turn"])) {
                        game.turn.questlines.splice(game.turn.questlines.indexOf(s), 1);
                    }
                }
            }
        });
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
            if (c.type == "Minion" && c.mana >= mana_range[0] && c.mana <= mana_range[1] && times < amount) {
                game.playMinion(c, game.turn);

                times++;

                return;
            }
        });
    }

    chooseOne(prompt, options, times = 1) {
        choices = [];

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

        console.log(choices);

        //exit()

        if (times === 1) {
            return choices[0];
        } else {
            return choices;
        }
    }

    spellDmg(target, damage) {
        game.stats.update("spellsThatDealtDamage", [target, damage]);

        if (target instanceof Minion) {
            target.remStats(0, this.accountForSpellDmg(damage));
        
            if (target.stats[1] > 0) {
                target.activateFrenzy(game);
            }

            this.killMinions();
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

    discover(prompt, amount = 3, flags = [], add_to_hand = true, _cards = []) {
        let values = _cards;

        if (_cards.length == 0) {
            let possible_cards = [];

            Object.entries(cards).forEach((c, _) => {
                c = c[1];

                if (c.type == "Spell" && c.class == "Neutral") {}
                else if (c.class === game.turn.class || c.class == "Neutral") {
                    if (flags.includes("Minion") && c.type !== "Minion") return;
                    if (flags.includes("Spell") && c.type !== "Spell") return;
                    if (flags.includes("Weapon") && c.type !== "Weapon") return;

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
            let stats = v.type == "Minion" ? ` [${v.stats[0]} / ${v.stats[1]}] ` : "";
            let desc = `(${v.desc})` || "";

            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: {${v.mana}} ${v.name}${stats}${desc} (${v.type}),\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        var choice = rl.question(p);

        if (!values[parseInt(choice) - 1]) {
            console.clear();
            printName();
            printAll(curr);

            return this.discover(prompt, amount, flags, add_to_hand, values);
        }

        var card = values[parseInt(choice) - 1];

        if (add_to_hand) {
            var c = null;

            if (card.type == 'Minion') c = new Minion(card.name, curr);
            if (card.type == 'Spell') c = new Spell(card.name, curr);
            if (card.type == 'Weapon') c = new Weapon(card.name, curr);

            game.stats.update("cardsAddedToHand", c);

            curr.hand.push(c);

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
                var t2 = rl.question(`Do you want to select your opponent's (${bn[parseInt(t) - 1].name}) or your own (${bo[parseInt(t) - 1].name})? (y: opponent, n: self | type 'back' to go back) `);
            
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
            p += `${i + 1}: ${c.name}, `;
        });

        p = p.slice(0, -2);

        p += "] ";

        var choice = rl.question(p);

        if (!cards[parseInt(choice) - 1]) {
            console.clear();
            printName();
            printAll(game.turn);

            return this.dredge(prompt);
        }

        var card = cards[parseInt(choice) - 1];

        game.turn.deck.push(card);
        game.turn.deck.splice(game.turn.deck.indexOf(card), 1);
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
        var cards = plr.deck.filter(c => c.name.startsWith("Galakrond, the "));
        if (cards.length <= 0) return;
        // ----------------------------

        switch (plr.class) {
            case "Priest":
                // Add a random Priest minion to your hand.
                var possible_cards = plr.deck.filter(c => c.type == "Minion" && c.class == "Priest");
                if (possible_cards.length <= 0) return;

                var card = game.functions.randList(possible_cards);
                plr.hand.push(card);

                break;
            case "Rogue":
                // Add a Lackey to your hand.
                const lackey_cards = ["Ethereal Lackey", "Faceless Lackey", "Goblin Lackey", "Kobold Lackey", "Witchy Lackey"];

                let min = new Minion(game.functions.randList(lackey_cards));

                game.stats.update("cardsAddedToHand", min);

                plr.hand.push(min, plr);

                break;
            case "Shaman":
                // Summon a 2/1 Elemental with Rush.
                let m = new Minion("Windswept Elemental", plr);

                game.stats.update("minionsSummoned", m);

                game.playMinion(m, plr);

                break;
            case "Warlock":
                // Summon two 1/1 Imps.
                let minion1 = new Minion("Draconic Imp", plr);
                let minion2 = new Minion("Draconic Imp", plr);

                game.stats.update("minionsSummoned", minion1);
                game.stats.update("minionsSummoned", minion2);

                game.playMinion(minion1, plr);
                game.playMinion(minion2, plr);

                break;
            case "Warrior":
                // Give your hero +3 Attack this turn.
                game.stats.update("heroAttackGained", 3);
                
                plr.attack += 3;

                break;
            default:
                break;
        }
    }

    addSecret(plr, card, key, val, callback, manual_progression = false) {
        if (plr.secrets.length >= 3 || plr.secrets.filter(s => s.name == card.name).length > 0) {
            plr.hand.push(card);
            plr.mana += card.mana;
            
            return false;
        }

        plr.secrets.push({"name": card.name, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "manual_progression": manual_progression});
    }
    addSidequest(plr, card, key, val, callback, manual_progression = false) {
        if (plr.sidequests.length >= 3 || plr.sidequests.filter(s => s.name == card.name).length > 0) {
            plr.hand.push(card);
            plr.mana += card.mana;
            
            return false;
        }

        plr.sidequests.push({"name": card.name, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "manual_progression": manual_progression});
    }
    addQuest(plr, card, key, val, callback, manual_progression = false) {
        if (plr.quests.length > 0) {
            plr.hand.push(card);
            plr.mana += card.mana;
            
            return false;
        }

        plr.quests.push({"name": card.name, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "manual_progression": manual_progression});
    }
    addQuestline(plr, card, key, val, callback, manual_progression = false) {
        if (plr.questlines.length > 0) {
            plr.hand.push(card);
            plr.mana += card.mana;
            
            return false;
        }

        plr.questlines.push({"name": card.name, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "manual_progression": manual_progression});
    }
}

function doTurn() {
    game.killMinions();

    console.clear();

    printName();

    curr = game.getTurn();

    if (curr !== prevPlr) {
        game.startTurn();
    }

    prevPlr = curr;

    printAll(curr);

    var q = rl.question("\nWhich card do you want to play? (type 'hero power' to use your hero power) ");

    if (q === "hero power") {
        curr.heroPower();

        return;
    }

    else if (q.startsWith("/give ")) {
        var t = q.split(" ");

        t.shift();

        q = t.join(" ");

        let card = Object.values(game.cards).find(c => c.name.toLowerCase() == q.toLowerCase());

        if (card.type === "Minion") {
            var m = new Minion(card.name, curr);
        } else if (card.type === "Spell") {
            var m = new Spell(card.name, curr);
        } else if (card.type === "Weapon") {
            var m = new Weapon(card.name, curr);
        }

        game.stats.update("cardsAddedToHand", m);

        curr.hand.push(m);
    } else if (q.startsWith("/class ")) {
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
        else if (q == "view") {
            var minion = game.functions.selectTarget("Which minion do you want to view?", false, null, "minion");

            if (minion === undefined) return;

            viewMinion(minion);
        }
        else if (q == "/eval") {
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
    
                    if (curr.weapon && curr.weapon.attackTimes > 0) {
                        curr.weapon.stats[1] -= 1;
                        curr.weapon.attackTimes -= 1;
    
                        curr.weapon.activateOnAttack(game);
    
                        if (curr.weapon.stats[1] <= 0) {
                            curr.weapon.activateDeathrattle(game);
    
                            curr.weapon = null;
                        }
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

                target.remStats(0, curr.attack);
                curr.remHealth(target.stats[0]);

                if (target.stats[1] > 0) {
                    target.activateFrenzy(game);
                }

                if (curr.weapon && curr.weapon.attackTimes > 0) {
                    curr.weapon.stats[1] -= 1;
                    curr.weapon.attackTimes -= 1;

                    curr.weapon.activateOnAttack(game);

                    if (curr.weapon.stats[1] <= 0) {
                        curr.weapon.activateDeathrattle(game);

                        curr.weapon = null;
                    }

                    if (curr.weapon.keywords.includes("Poisonous")) {
                        target.stats[1] = 0;
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

                attacker.activateOnAttack(game);

                if (attacker.keywords.includes("Lifesteal")) {
                    curr.addHealth(attacker.stats[0]);
                }

                if (attacker.keywords.includes("Poisonous")) {
                    target.stats[1] = 0;
                }

                if (target.keywords.includes("Poisonous")) {
                    attacker.stats[1] = 0;
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
        card.activateOutcast(game);
    }

    game.playCard(card, curr);
}

function printName() {
    console.log("|-----------------------------|");
    console.log("|       HEARTHSTONE.JS        |");
    console.log("|-----------------------------|");
}

function printAll(curr) {
    console.log(`\n${curr.getName()}'s turn\n`);

    console.log("-------------------------------");

    console.log(`Mana: ${curr.getMana()} / ${curr.getMaxMana()}`);
    console.log(`Health: ${curr.health} + ${curr.armor} / ${curr.maxHealth}\n`);

    console.log(`Attack: ${curr.attack}`);
    console.log(`Weapon: ${curr.weapon === null ? "None" : `${curr.weapon.name} (${curr.weapon.getStats().join(' / ')})`}\n`);

    console.log(`Secrets: ${curr.secrets.length == 0 ? "None" : curr.secrets.map(x => x["name"]).join(', ')}`);
    console.log(`Sidequests: ${curr.sidequests.length == 0 ? "None" : curr.sidequests.map(x => x["name"] + " (" + x["progress"][0] + " / " + x["progress"][1] + ")").join(', ')}`);
    console.log(`Quest: ${curr.quests.length == 0 ? "None" : curr.quests[0]["name"] + " (" + curr.quests[0]["progress"][0] + " / " + curr.quests[0]["progress"][1] + ")"}`);
    console.log(`Questline: ${curr.questlines.length == 0 ? "None" : curr.questlines[0]["name"] + " (" + curr.questlines[0]["progress"][0] + " / " + curr.questlines[0]["progress"][1] + ")"}\n`);

    console.log(`Deck Size: ${curr.getDeck().length}`);
    
    console.log("-------------------------------");
    
    console.log(`Opponent's Mana: ${game.nextTurn.getMana()} / ${game.nextTurn.getMaxMana()}`);
    console.log(`Opponent's Health: ${game.nextTurn.health} + ${game.nextTurn.armor} / ${game.nextTurn.maxHealth}\n`);

    console.log(`Opponent's Weapon: ${game.nextTurn.weapon === null ? "None" : `${game.nextTurn.weapon.name} (${game.nextTurn.weapon.getStats().join(' / ')})`}\n`);

    console.log(`Secrets: ${game.nextTurn.secrets.length == 0 ? "None" : game.nextTurn.secrets.length + 1}`);
    console.log(`Sidequests: ${game.nextTurn.sidequests.length == 0 ? "None" : game.nextTurn.sidequests.map(x => x["name"] + " (" + x["progress"][0] + " / " + x["progress"][1] + ")").join(', ')}`);
    console.log(`Quest: ${game.nextTurn.quests.length == 0 ? "None" : game.nextTurn.quests[0]["name"] + " (" + game.nextTurn.quests[0]["progress"][0] + " / " + game.nextTurn.quests[0]["progress"][1] + ")"}`);
    console.log(`Questline: ${game.nextTurn.questlines.length == 0 ? "None" : game.nextTurn.questlines[0]["name"] + " (" + game.nextTurn.questlines[0]["progress"][0] + " / " + game.nextTurn.queslines[0]["progress"][1] + ")"}\n`);

    console.log(`Opponent's Hand Size: ${game.nextTurn.getHand().length}`);
    console.log(`Opponent's Deck Size: ${game.nextTurn.getDeck().length}`);

    console.log("-------------------------------");

    console.log("\n--- Board ---\n");
    game.getBoard().forEach((_, i) => {
        var t = `- ${game.plrIndexToName(i)} -`;

        console.log(t) // This is not for debugging, do not comment out

        if (game.getBoard()[i].length == 0) {
            console.log("(None)");
        } else {
            game.getBoard()[i].forEach((m, n) => {
                var keywords = m.getKeywords().length > 0 ? ` {${m.getKeywords().join(", ")}}` : "";
                var frozen = m.frozen && !m.dormant ? " (Frozen)" : "";
                var immune = m.immune && !m.dormant ? " (Immune)" : "";
                var dormant = m.dormant ? " (Dormant)" : "";

                console.log(`${m.getName()} (${m.getStats().join(" / ")})${keywords}${frozen}${immune}${dormant} [${n + 1}]`);
            });
        }
        console.log("-".repeat(t.length));
    });
    console.log("\n-------------")

    console.log("\n--- Hand ---");
    console.log("({cost} Name [attack / health] (type) [id])\n");

    curr.getHand().forEach((card, i) => {
        if (card.type === "Minion" || card.type === "Weapon") {
            var desc = card.getDesc().length > 0 ? ` (${card.getDesc()}) ` : " ";
            console.log(`{${card.getCost()}} ${card.getName()} [${card.getStats().join(' / ')}]${desc}(${card.getType()}) [${i + 1}]`);
        } else {
            var desc = card.getDesc().length > 0 ? ` (${card.getDesc()}) ` : " ";
            console.log(`{${card.getCost()}} ${card.getName()}${desc}(${card.getType()}) [${i + 1}]`);
        }
    });
    console.log("------------")
}

function viewMinion(minion, detailed = false) {
    console.log(`{${minion.getCost()}} ${minion.getName()} [${minion.blueprint.stats.join(' / ')}]\n`);
    if (minion.getDesc()) console.log(minion.getDesc() + "\n");
    console.log("Tribe: " + minion.getTribe());
    console.log("Class: " + minion.getClass());
    console.log("Is Frozen: " + minion.frozen && !minion.dormant);
    console.log("Is Immune: " + minion.immune && !minion.dormant);
    console.log("Is Dormant: " + minion.dormant != false);
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

console.clear();
printName();

const name1 = rl.question("\nPlayer 1, what is your name? ");
const name2 = rl.question("Player 2, what is your name? ");

console.clear();
printName();
const passcode1 = rl.question(`\nPlayer 1 (${name1}), please enter your passcode: `, {hideEchoBack: true});
console.clear();
printName();
const passcode2 = rl.question(`\nPlayer 2 (${name2}), please enter your passcode: `, {hideEchoBack: true});
console.clear();

const player1 = new Player(name1);
const player2 = new Player(name2);

player1.passcode = crypto.createHash('sha256').update(passcode1).digest('hex');
player2.passcode = crypto.createHash('sha256').update(passcode2).digest('hex');

const game = new Game(player1, player2, new Functions());

while (game.player1.getDeck().length < 30) {
    game.player1.deck.push(new Minion("Sheep", game.player1));
}
while (game.player2.getDeck().length < 30) {
    game.player2.deck.push(new Minion("Sheep", game.player2));
}

game.functions.shuffle(game.player1.deck);
game.functions.shuffle(game.player2.deck);

game.startGame();

var running = true;

var prevPlr = null;

while (running) {
    doTurn();
}