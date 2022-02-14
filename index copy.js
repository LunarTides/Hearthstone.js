const fs = require('fs');
const { exit } = require('process');
const rl = require('readline-sync');

cards = {};

const importCards = path => {
    fs.readdirSync(path, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name).forEach(dir => {
        fs.readdirSync(path + "/" + dir).forEach(file => {
            if (file.endsWith(".json")) {
                var json = require(path + '/' + dir + "/" + file);
                cards[json.name] = json;
            } else {
                importCards(path + "/" + dir);
            }
        });
    });
}

fs.readdirSync(__dirname + '/cards').forEach(file => {
    if (file.endsWith(".json")) {
        var json = require(__dirname + '/cards/' + file);
        cards[json.name] = json;
    }
});

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
        this.oghealth = null;
        this.hasAttacked = false;

        this.turn = null;

        this.hasBattlecry = this.blueprint.battlecry != undefined;
        this.hasDeathrattle = this.blueprint.deathrattle != undefined;
        this.hasInspire = this.blueprint.inspire != undefined;
        this.hasEndOfTurn = this.blueprint.endofturn != undefined;
        this.hasStartOfTurn = this.blueprint.startofturn != undefined;

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

    getBattlecry() {
        return this.battlecry;
    }

    getDeathrattle() {
        return this.deathrattle;
    }

    getInspire() {
        return this.inspire;
    }
    
    getEndOfTurn() {
        return this.endofturn;
    }

    getStartOfTurn() {
        return this.startofturn;
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

    setBattlecry(battlecry) {
        this.battlecry = battlecry;
    }

    setDeathrattle(deathrattle) {
        this.deathrattle = deathrattle;
    }

    setInspire(inspire) {
        this.inspire = inspire;
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

        this.cast = this.blueprint.cast.join('\n');
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

    getCast() {
        return this.cast;
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

    setCast(cast) {
        this.cast = cast;
    }

    activateCast(game) {
        eval(this.cast);
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

        this.hasBattlecry = this.blueprint.battlecry != undefined;
        this.hasDeathrattle = this.blueprint.deathrattle != undefined;
        this.hasOnAttack = this.blueprint.onattack != undefined;

        if (this.hasBattlecry) {
            this.battlecry = this.blueprint.battlecry.join('\n');
        }
        if (this.hasDeathrattle) {
            this.deathrattle = this.blueprint.deathrattle.join('\n');
        }
        if (this.hasOnAttack) {
            this.onattack = this.blueprint.onattack.join('\n');
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

    getBattlecry() {
        return this.battlecry;
    }

    getDeathrattle() {
        return this.deathrattle;
    }

    getOnAttack() {
        return this.onattack;
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

    setBattlecry(battlecry) {
        this.battlecry = battlecry;
    }

    setDeathrattle(deathrattle) {
        this.deathrattle = deathrattle;
    }

    setOnAttack(onattack) {
        this.onattack = onattack;
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
            this.game.endGame(this);
        }
    }

    drawCard() {
        if (this.deck.length <= 0) {
            this.fatigue++;

            this.remHealth(this.fatigue);
            
            return;
        }

        var card = this.deck.pop()

        if (card.type == "Minion") {
            card = new Minion(card.name);
        } else if (card.type == "Spell") {
            card = new Spell(card.name);
        } else if (card.type == "Weapon") {
            card = new Weapon(card.name);
        }

        if (this.getHand().length < 10) this.hand.push(card);

        return card;
    }

    heroPower() {
        if (this.class == "Demon Hunter") this.heroPowerCost = 1;

        if (this.getMana() < this.heroPowerCost || !this.canUseHeroPower) return false;

        this.game.getBoard().forEach((_, i) => {
            this.game.getBoard()[i].forEach(m => {
                m.activateInspire(this.game);
            });
        });

        this.setMana(this.getMana() - this.heroPowerCost);

        this.canUseHeroPower = false;

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
            var t = selectTarget("Deal 1 damage to a minion", false);

            if (t == "face") {
                game.nextTurn.remHealth(1);

                return;
            }

            game.attackMinion(1, t);
        }
        else if (this.class == "Paladin") {
            game.playMinion(new Minion("Silver Hand Recruit"), this);
        }
        else if (this.class == "Priest") {
            var t = selectTarget("Restore 2 health to a minion", true);

            if (t == "face") {
                this.addHealth(2);

                return;
            }

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
    }

    endGame() {
        process.stdout.write('\x1Bc'); 

        if (this.player1.health < 0) {
            console.log("Player 2 wins!");
        } else {
            console.log("Player 1 wins!");
        }

        exit(0);
    }

    endTurn() {
        this.getBoard()[this.plrNameToIndex(this.turn.getName())].forEach(m => {
            m.activateEndOfTurn(this);
        });

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

        this.getBoard()[this.plrNameToIndex(this.turn.getName())].forEach(m => {
            m.activateStartOfTurn(this);
            m.hasAttacked = false;
        });

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
    }

    playMinion(minion, player) {
        var p = this.plrNameToIndex(player.getName());

        var m = new Minion(minion.name);
        m.setStats(minion.stats);
        m.setDeathrattle(minion.deathrattle);
        m.turn = this.turns;
        m.oghealth = minion.stats[1];

        this.board[p].push(m);
    }

    killMinions() {
        for (var p = 0; p < 2; p++) {
            var n = [];
            
            this.getBoard()[p].forEach(m => {
                if (m.getHealth() <= 0) {
                    m.activateDeathrattle(this);
                } else {
                    n.push(m);
                }
            });

            this.board[p] = n;
        }
    }

    attackMinion(minion, target) {
        if (!isNaN(minion)) {
            target.stats = [target.stats[0], target.stats[1] - minion];

            this.killMinions();

            return;
        } else if (!minion.hasAttacked) {
            console.log(minion)
            //exit()

            if (minion.getStats()[0] <= 0) return false;

            target.stats = [target.stats[0], target.stats[1] - minion.stats[0]];
            minion.stats = [minion.stats[0], minion.stats[1] - target.stats[0]];

            minion.hasAttacked = true;

            this.killMinions();

            return true;
        }
    }
}

function selectTarget(prompt, self) {
    str = self ? "your" : "the enemy"

    var t = rl.question(`\n${prompt} (type 'face' to select ${str} hero) `);

    if (t.toLowerCase() === "face") {
        return "face";
    }

    p1 = game.plrNameToIndex(curr.getName());
    p2 = p1

    p1 = (p1 === 0) ? 1 : 0;

    if (self) {
        var m = game.getBoard()[p2][parseInt(t) - 1];
    } else {
        var m = game.getBoard()[p1][parseInt(t) - 1];
    }

    if (m === undefined) {
        console.log("Invalid minion");
        return false;
    }

    return m;
}

function doTurn() {
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
                console.log(`${m.getName()} (${m.getStats().join(" / ")})`);
            });
        }
        console.log("-".repeat(t.length));
    });
    console.log("\n-------------")

    console.log("\n--- Hand ---");
    console.log("({cost} Name [attack / health] (type) [id])\n");

    curr.getHand().forEach((card, i) => {
        if (card.type === "Minion" || card.type === "Weapon") {
            console.log(`{${card.getCost()}} ${card.getName()} [${card.getStats().join(' / ')}] (${card.getType()}) [${i + 1}]`);
        } else {
            console.log(`{${card.getCost()}} ${card.getName()} (${card.getType()}) [${i + 1}]`);
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
            var q2 = rl.question("\nWhich minion do you want to attack with? (type 'face' to attack with your hero) ");
            var q3 = rl.question("\nWhich minion do you want to attack? (type 'face' to attack the enemy hero) ");

            p1 = game.plrNameToIndex(curr.getName());
            p2 = p1

            p1 = (p1 === 0) ? 1 : 0;

            if (q3.toLowerCase() === "face") {
                if (q2.toLowerCase() === "face") {
                    if (curr.attack > 0) {
                        game.nextTurn.remHealth(curr.attack);

                        if (curr.weapon) {
                            curr.weapon.stats[1] -= 1;

                            curr.weapon.activateOnAttack(game);

                            if (curr.weapon.stats[1] <= 0) {
                                curr.weapon.activateDeathrattle(game);

                                curr.weapon = null;
                            }

                        }

                        curr.attack = 0;
                    }

                    return;
                }

                var m2 = game.getBoard()[p2][parseInt(q2) - 1];

                if (m2 === undefined) {
                    console.log("Invalid minion");
                    return;
                }

                if (m2.turn == game.getTurns()) {
                    console.log("That minion cannot attack this turn!");
                    return;
                }

                if (m2.hasAttacked) {
                    console.log("That minion has already attacked this turn!");
                    return;
                }

                m2.hasAttacked = true;

                game.nextTurn.remHealth(m2.stats[0]);
            } else if (q2.toLowerCase() === "face") {
                var m1 = game.getBoard()[p1][parseInt(q3) - 1];

                if (m1 === undefined) {
                    console.log("Invalid minion");
                    return;
                }

                game.nextTurn.remHealth(m1.stats[0]);
                curr.remHealth(m1.stats[0]);

                if (curr.weapon) {
                    curr.weapon.stats[1] -= 1;

                    curr.weapon.activateOnAttack(game);

                    if (curr.weapon.stats[1] <= 0) {
                        curr.weapon.activateDeathrattle(game);

                        curr.weapon = null;
                    }
                }

                curr.attack = 0;

                game.killMinions();

                return;
            }

            var m1 = game.getBoard()[p1][parseInt(q3) - 1];
            var m2 = game.getBoard()[p2][parseInt(q2) - 1];

            if (m1 === undefined || m2 === undefined) {
                console.log("Invalid minion");
                return;
            }

            if (m2.turn == game.getTurns()) {
                console.log("That minion has cannot attack this turn!");
                return;
            }

            game.attackMinion(m2, m1);

        }
        
        else {
            console.log("Invalid card.");
        }

        return;
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