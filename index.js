const fs = require('fs');
const { exit } = require('process');
const rl = require('readline-sync');

cards = {};

function importCards(path) {
    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        if (file.name.endsWith(".json")) {
            var json = require(`${path}/${file.name}`);
            cards[json.name] = json;
        } else if (file.isDirectory()) {
            importCards(`${path}/${file.name}`);
        }
    });
}

importCards(__dirname + '/cards');

class Minion {
    constructor(name) {
        this.blueprint = cards[name];

        this.name = name;
        this.type = this.blueprint.type;
        this.stats = this.blueprint.stats;
        this.desc = this.blueprint.desc;
        this.mana = this.blueprint.mana;
        this.tribe = this.blueprint.tribe;
        this.class = this.blueprint.class;
        this.rarity = this.blueprint.rarity;
        this.set = this.blueprint.set;
        this.keywords = this.blueprint.keywords || [];
        this.oghealth = null;
        this.corrupted = this.blueprint.corrupted || false;
        this.frozen = false;
        this.immune = false;
        this.echo = false;
        this.canAttackHero = true;
        this.attackTimes = 1;

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

        if (this.hasBattlecry) {
            this.battlecry = this.blueprint.battlecry.join('\n');
        }
        if (this.hasDeathrattle) {
            this.deathrattle = this.blueprint.deathrattle.join('\n');
        }
        if (this.hasInspire) {
            this.inspire = this.blueprint.inspire.join('\n');
        }
        if (this.hasEndOfTurn) {
            this.endofturn = this.blueprint.endofturn.join('\n');
        }
        if (this.hasStartOfTurn) {
            this.startofturn = this.blueprint.startofturn.join('\n');
        }
        if (this.hasCombo) {
            this.combo = this.blueprint.combo.join('\n');
        }
        if (this.hasOnAttack) {
            this.onattack = this.blueprint.onattack.join('\n');
        }
        if (this.hasOutcast) {
            this.outcast = this.blueprint.outcast.join('\n');
        }
        if (this.hasStartOfGame) {
            this.startofgame = this.blueprint.startofgame.join('\n');
        }
        if (this.hasOverkill) {
            this.overkill = this.blueprint.overkill.join('\n');
        }
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

    setStats(stats) {
        this.stats = stats;
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
        this.deathrattle = deathrattle;
    }

    setEndOfTurn(endofturn) {
        this.endofturn = endofturn;
    }

    setStartOfTurn(startofturn) {
        this.startofturn = startofturn;
    }

    addDeathrattle(deathrattle) {
        this.deathrattle += '\n' + deathrattle;
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
    }

    activateBattlecry(game) {
        if (!this.hasBattlecry) return false;
        eval(this.battlecry);
    }

    activateDeathrattle(game) {
        if (!this.hasDeathrattle) return false;
        eval(this.deathrattle);
    }

    activateInspire(game) {
        if (!this.hasInspire) return false;
        eval(this.inspire);
    }

    activateEndOfTurn(game) {
        if (!this.hasEndOfTurn) return false;
        eval(this.endofturn);
    }

    activateStartOfTurn(game) {
        if (!this.hasStartOfTurn) return false;
        eval(this.startofturn);
    }

    activateCombo(game) {
        if (!this.hasCombo) return false;
        eval(this.combo);
    }

    activateOnAttack(game) {
        if (!this.hasOnAttack) return false;
        eval(this.onAttack);
    }

    activateOutcast(game) {
        if (!this.hasOutcast) return false;
        eval(this.outcast);
    }

    activateStartOfGame(game) {
        if (!this.hasStartOfGame) return false;
        eval(this.startofgame);
    }

    activateOverkill(game) {
        if (!this.hasOverkill) return false;
        eval(this.overkill);
    }

}

class Spell {
    constructor(name) {
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

        this.echo = false;

        this.hasCast = this.blueprint.cast != undefined;
        this.hasCombo = this.blueprint.combo != undefined;
        this.hasOutcast = this.blueprint.outcast != undefined;
        this.hasCastOnDraw = this.blueprint.castondraw != undefined;

        if (this.hasCast) {
            this.cast = this.blueprint.cast.join('\n');
        }
        if (this.hasCombo) {
            this.combo = this.blueprint.combo.join('\n');
        }
        if (this.hasOutcast) {
            this.outcast = this.blueprint.outcast.join('\n');
        }
        if (this.hasCastOnDraw) {
            this.castondraw = this.blueprint.castondraw.join('\n');
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
        eval(this.cast);
    }

    activateCombo(game) {
        if (!this.hasCombo) return false;
        eval(this.combo);
    }

    activateOutcast(game) {
        if (!this.hasOutcast) return false;
        eval(this.outcast);
    }

    activateCastOnDraw(game) {
        if (!this.hasCastOnDraw) return false;
        eval(this.castondraw);
        return true;
    }

}

class Weapon {
    constructor(name) {
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

        this.echo = false;

        this.hasBattlecry = this.blueprint.battlecry != undefined;
        this.hasDeathrattle = this.blueprint.deathrattle != undefined;
        this.hasOnAttack = this.blueprint.onattack != undefined;
        this.hasCombo = this.blueprint.combo != undefined;
        this.hasOutcast = this.blueprint.outcast != undefined;

        if (this.hasBattlecry) {
            this.battlecry = this.blueprint.battlecry.join('\n');
        }
        if (this.hasDeathrattle) {
            this.deathrattle = this.blueprint.deathrattle.join('\n');
        }
        if (this.hasOnAttack) {
            this.onattack = this.blueprint.onattack.join('\n');
        }
        if (this.hasCombo) {
            this.combo = this.blueprint.combo.join('\n');
        }
        if (this.hasOutcast) {
            this.outcast = this.blueprint.outcast.join('\n');
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

    setStats(stats) {
        this.stats = stats;
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

    addBattlecry(battlecry) {
        this.battlecry += '\n' + battlecry;
    }

    addDeathrattle(deathrattle) {
        this.deathrattle += '\n' + deathrattle;
    }

    addOnAttack(onattack) {
        this.onattack += '\n' + onattack;
    }

    activateBattlecry(game) {
        if (!this.hasBattlecry) return false;
        eval(this.battlecry);
    }

    activateDeathrattle(game) {
        if (!this.hasDeathrattle) return false;
        eval(this.deathrattle);
    }

    activateOnAttack(game) {
        if (!this.hasOnAttack) return false;
        eval(this.onattack);
    }

    activateCombo(game) {
        if (!this.hasCombo) return false;
        eval(this.combo);
    }

    activateOutcast(game) {
        if (!this.hasOutcast) return false;
        eval(this.outcast);
    }
}


class Player {
    constructor(name) {
        this.name = name;
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
            this.game.endGame(game.nextTurn);
        }
    }

    drawCard() {
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

        return card;
    }

    heroPower() {
        if (this.class == "Demon Hunter") this.heroPowerCost = 1;

        if (this.getMana() < this.heroPowerCost || !this.canUseHeroPower) return false;

        if (this.class == "Demon Hunter") {
            this.attack += 1;
        }
        else if (this.class == "Druid") {
            this.attack += 1;
            this.armor += 1;
        }
        else if (this.class == "Hunter") {
            this.game.nextTurn.remHealth(2);
        }
        else if (this.class == "Mage") {
            var t = selectTarget("Deal 1 damage to a minion");

            if (t == false) return false;

            if (t instanceof Player) {
                t.remHealth(1);
            } else {
                game.attackMinion(1, t);
            }
        }
        else if (this.class == "Paladin") {
            game.playMinion(new Minion("Silver Hand Recruit"), this);
        }
        else if (this.class == "Priest") {
            var t = selectTarget("Restore 2 health to a minion");

            if (t == false) return false;

            t.addHealth(2);
        }
        else if (this.class == "Rogue") {
            this.weapon = new Weapon("Wicked Knife");
        }
        else if (this.class == "Shaman") {
            const totem_cards = ["Healing Totem", "Searing Totem", "Stoneclaw Totem", "Strength Totem"];

            game.getBoard()[game.plrNameToIndex(game.turn.getName())].forEach(m => {
                if (totem_cards.includes(m.name)) {
                    totem_cards.splice(totem_cards.indexOf(m.name), 1);
                }
            });

            if (totem_cards.length == 0) {
                return;
            }

            game.playMinion(new Minion(totem_cards[Math.floor(Math.random() * totem_cards.length)]), this);
        }
        else if (this.class == "Warlock") {
            this.remHealth(2);

            this.drawCard();
        }
        else if (this.class == "Warrior") {
            this.armor += 2;
        }

        this.game.getBoard().forEach((_, i) => {
            this.game.getBoard()[i].forEach(m => {
                m.activateInspire(this.game);
            });
        });

        this.setMana(this.getMana() - this.heroPowerCost);

        this.canUseHeroPower = false;

    }

}

class Game {
    constructor(player1, player2) {
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
        this.player1.drawCard();
        this.player1.drawCard();
        this.player1.drawCard();

        this.player2.drawCard();
        this.player2.drawCard();
        this.player2.drawCard();
        this.player2.drawCard();
        this.player2.hand.push(new Spell("The Coin"));

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
        process.stdout.write('\x1Bc');

        console.log(`Player ${p.getName()} wins!`);

        exit(0);
    }

    endTurn() {
        this.getBoard()[this.plrNameToIndex(this.turn.getName())].forEach(m => {
            m.activateEndOfTurn(this);
        });

        var _c = [];

        this.player1.hand.forEach(c => {
            if (!c.echo) {
                _c.push(c);
            }
        });

        this.player1.setHand(_c);

        _c = [];

        this.player2.hand.forEach(c => {
            if (!c.echo) {
                _c.push(c);
            }
        });

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
        if (this.turn.weapon !== null) {
            this.turn.attack += this.turn.weapon.stats[0];
        }

        this.turn.mana -= this.turn.overload;
        this.turn.overload = 0;

        this.getBoard()[this.plrNameToIndex(this.turn.getName())].forEach(m => {
            m.activateStartOfTurn(this);
            m.canAttackHero = true;
            m.resetAttackTimes();
        });

        if (this.turn.weapon) this.turn.weapon.resetAttackTimes();

        this.turn.drawCard();

        this.turn.canUseHeroPower = true;
    }

    playCard(card, player) {
        if (player.getMana() < card.getCost()) {
            return false;
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

        if (card.getType() === "Minion") {
            game.playMinion(card, player);

            card.activateBattlecry(this);
        } else if (card.getType() === "Spell") {
            card.activateCast(this);
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
                        t = new Minion(c.corrupted[1]);
                    } else if (c.corrupted[0] == "Spell") {
                        t = new Spell(c.corrupted[1]);
                    } else if (c.corrupted[0] == "Weapon") {
                        t = new Weapon(c.corrupted[1]);
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

        var p = this.plrNameToIndex(player.getName());

        if (minion.keywords.includes("Charge")) {
            minion.turn = this.turns - 1;
        }

        if (minion.keywords.includes("Rush")) {
            minion.turn = this.turns - 1;
            minion.canAttackHero = false;
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

                    if (m.keywords.includes("Reborn")) {
                        m.removeKeyword("Reborn");

                        m.stats = [m.stats[0], 1];

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

            target.stats = [target.stats[0], target.stats[1] - minion];

            this.killMinions();

            return;
        } else if (minion.attackTimes > 0) {
            if (minion.getStats()[0] <= 0) return false;

            minion.stats = [minion.stats[0], minion.stats[1] - target.stats[0]];

            if (target.keywords.includes("Divine Shield")) {
                target.removeKeyword("Divine Shield");

                return false;
            }

            target.stats = [target.stats[0], target.stats[1] - minion.stats[0]];

            if (target.getStats()[1] < 0) {
                minion.activateOverkill(this);
            }

            return true;
        }
    }
}

function chooseOne(prompt, options, times = 1) {
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

function spellDmg(target, damage) {
    if (target instanceof Minion) {
        target.stats = [target.stats[0], target.stats[1] - (damage + game.turn.spellDamage)];
    } else if (target instanceof Player) {
        target.remHealth(damage + game.turn.spellDamage);
    }
}

function discover(prompt, amount = 3, flags = [], add_to_hand = true) {
    var possible_cards = [];
    var values = [];

    Object.entries(cards).forEach((c, _) => {
        c = c[1];

        if (c.class === game.turn.class) {
            if (flags.includes("Minion") && c.type !== "Minion") return;
            if (flags.includes("Spell") && c.type !== "Spell") return;
            if (flags.includes("Weapon") && c.type !== "Weapon") return;

            possible_cards.push(c);
        }
    });

    if (possible_cards.length == 0) return;

    for (var i = 0; i < amount; i++) {
        var c = possible_cards[Math.floor(Math.random() * possible_cards.length)];

        values.push(c);
        possible_cards.splice(possible_cards.indexOf(c), 1);
    }

    var p = `\n${prompt} [`;

    if (values.length <= 0) return;

    values.forEach((v, i) => {
        p += `${i + 1}: ${v.name}, `;
    });

    p = p.slice(0, -2);
    p += "] ";

    var choice = rl.question(p);

    var card = values[parseInt(choice) - 1];

    if (add_to_hand) {
        var c = null;

        if (card.type == 'Minion') c = new Minion(card.name);
        if (card.type == 'Spell') c = new Spell(card.name);
        if (card.type == 'Weapon') c = new Weapon(card.name);

        curr.hand.push(c);

        return c;
    } else {
        return card;
    }
}

function selectTarget(prompt, force = null) {
    var t = rl.question(`\n${prompt} (type 'face' to select a hero | type 'back' to go back) `);

    if (t.startsWith("b")) {
        var t2 = rl.question(`WARNING: Going back might cause unexpected things to happen. Do you still want to go back? (y / n) `);
        
        if (t2.startsWith("y")) {
            return false;
        }
    }

    var bn = game.getBoard()[game.plrNameToIndex(game.nextTurn.getName())];
    var bo = game.getBoard()[game.plrNameToIndex(game.turn.getName())];

    if (!t.startsWith("f") && !bo[parseInt(t)] && !bn[parseInt(t)]) {
        selectTarget(prompt);

        return false;
    }

    if (!force) {
        if (t.startsWith("f")) {
            var t2 = rl.question(`Do you want to select the enemy hero, or your own hero? (y: enemy, n: self) `);
    
            return (t2.startsWith("y")) ? game.nextTurn : game.turn;
        }
        
        if (bn.length >= parseInt(t) && bo.length >= parseInt(t)) {
            var t2 = rl.question(`Do you want to select your opponent's (${bn[parseInt(t) - 1].name}) or your own (${bo[parseInt(t) - 1].name})? (y: opponent, n: self | type 'back' to go back) `);
        
            if (t2.startsWith("b")) {
                selectTarget(prompt);

                return false;
            }
        } else {
            if (bn.length >= parseInt(t)) var t2 = "y";
            else if (bo.length >= parseInt(t)) var t2 = "n";
        }
    } else {
        if (t.startsWith("f")) {
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

    if (m === undefined) {
        console.log("Invalid minion");
        return false;
    }

    return m;
}

function doTurn() {
    game.killMinions();

    process.stdout.write('\x1Bc'); 

    console.log("|-----------------------------|");
    console.log("|       HEARTHSTONE.JS        |");
    console.log("|-----------------------------|");

    curr = game.getTurn();

    if (curr !== prevPlr) {
        game.startTurn();
    }

    prevPlr = curr;

    console.log(`\n${curr.getName()}'s turn\n`);

    console.log("------------------------------");

    console.log(`Mana: ${curr.getMana()} / ${curr.getMaxMana()}`);
    console.log(`Health: ${curr.health} + ${curr.armor} / ${curr.maxHealth}\n`);

    console.log(`Attack: ${curr.attack}`);
    console.log(`Weapon: ${curr.weapon === null ? "None" : `${curr.weapon.name} (${curr.weapon.getStats().join(' / ')})`}\n`);

    console.log(`Deck Size: ${curr.getDeck().length}`);
    
    console.log("------------------------------");
    
    console.log(`Opponent's Mana: ${game.nextTurn.getMana()} / ${game.nextTurn.getMaxMana()}`);
    console.log(`Opponent's Health: ${game.nextTurn.health} + ${game.nextTurn.armor} / ${game.nextTurn.maxHealth}\n`);

    console.log(`Opponent's Weapon: ${game.nextTurn.weapon === null ? "None" : `${game.nextTurn.weapon.name} (${game.nextTurn.weapon.getStats().join(' / ')})`}\n`);

    console.log(`Opponent's Hand Size: ${game.nextTurn.getHand().length}`);
    console.log(`Opponent's Deck Size: ${game.nextTurn.getDeck().length}`);

    console.log("------------------------------");

    console.log("\n--- Board ---\n");
    game.getBoard().forEach((_, i) => {
        var t = `- ${game.plrIndexToName(i)} -`;

        console.log(t)

        if (game.getBoard()[i].length == 0) {
            console.log("(None)");
        } else {
            game.getBoard()[i].forEach(m => {
                var keywords = m.getKeywords().length > 0 ? ` [${m.getKeywords().join(", ")}]` : "";

                console.log(`${m.getName()} (${m.getStats().join(" / ")})${keywords}`);
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

    var q = rl.question("\nWhich card do you want to play? (type 'hero power' to use your hero power) ");

    if (q === "hero power") {
        curr.heroPower();

        return;
    }

    else if (q.startsWith("/give ")) {
        var t = q.split(" ");

        t.shift();
        var type = t.shift();

        q = t.join(" ");

        if (type === "minion") {
            var m = new Minion(q);
        } else if (type === "spell") {
            var m = new Spell(q);
        } else if (type === "weapon") {
            var m = new Weapon(q);
        } else {
            console.log("Invalid card type");
            return;
        }

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
        else if (q === "attack") {
            var attacker = selectTarget("Which minion do you want to attack with?", "self");
            if (attacker === false) return;
            if (attacker.frozen) return;

            var target = selectTarget("Which minion do you want to attack?", "enemy");
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

                target.stats = [target.stats[0], target.stats[1] - curr.attack];
                curr.remHealth(target.stats[0]);

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

const game = new Game(new Player('Isak'), new Player('Sondre'));

while (game.player1.getDeck().length < 30) {
    game.player1.deck.push(new Minion("Sheep"));
}
while (game.player2.getDeck().length < 30) {
    game.player2.deck.push(new Minion("Sheep"));
}

game.startGame();

var running = true;

var prevPlr = null;

while (running) {
    doTurn();
}