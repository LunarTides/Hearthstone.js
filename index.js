/*
Hearthstone.js - Hearthstone but console based.
Copyright (C) 2022  Keatpole

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const fs = require('fs');
const { exit } = require('process');
const rl = require('readline-sync');
const crypto = require('crypto');
const { Game } = require("./game");
const { Minion, Spell, Weapon, Hero, setup_card } = require("./card");
const { Player, setup_other } = require("./other");

const license_url = 'https://github.com/Keatpole/Hearthstone.js/blob/main/LICENSE';
const copyright_year = "2022";

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

function doTurn() {
    game.killMinions();

    printName();

    curr = game.getPlayer();

    if (curr !== prevPlr) {
        game.startTurn();
    }

    prevPlr = curr;

    printAll(curr);

    let input = "\nWhich card do you want to play? ";
    if (game.turns <= 2) input += "(type 'help' for further information <- This will disappear once you end your turn) ";

    var q = game.input(input);

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
            game.input("\n(In order to run a command; input the name of the command and follow further instruction.)\n\nAvailable commands:\n\nend - Ends your turn\nattack - Attack\nview - View a minion\nhero power - Use your hero power\ndetail - Get more details about opponent\nhelp - Displays this message\n\nPress enter to continue...");
        }
        else if (q == "view") {
            var minion = game.functions.selectTarget("Which minion do you want to view?", false, null, "minion");

            if (minion === undefined) return;

            viewMinion(minion);
        }
        else if (q == "detail") {
            printName();
            printAll(curr, true);

            game.input("Press enter to continue...");

            printName();
            printAll(curr);
        }
        else if (q == "license") {
            var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
            require('child_process').exec(start + ' ' + license_url);
        }
        else if (q == "/eval") {
            if (!_debug) return;

            eval(game.input("\nWhat do you want to evaluate? "));
        }
        else if (q === "attack") {
            var attacker = game.functions.selectTarget("Which minion do you want to attack with?", false, "self");
            if (attacker === false) return;
            if (attacker.frozen) return;

            var target = game.functions.selectTarget("Which minion do you want to attack?", false, "enemy");
            if (target === false) return;

            var prevent = false;

            game.getBoard()[game.plrNameToIndex(game.opponent.getName())].forEach(m => {
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
                if (game.opponent.immune) return;
                if (attacker instanceof Minion && !attacker.canAttackHero) return;

                if (attacker instanceof Player) {

                    game.stats.update("enemyAttacks", "hero");
                    game.stats.update("heroAttacks", [attacker, target]);
                    game.stats.update("heroAttacked", [attacker, target, game.turns]);

                    game.opponent.remHealth(curr.attack);
    
                    if (curr.weapon && curr.weapon.attackTimes > 0 && curr.weapon.stats[0]) {
                        curr.weapon.attackTimes -= 1;
    
                        curr.weapon.activateDefault("onattack");
                        curr.weapon.remStats(0, 1);
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

                game.opponent.remHealth(attacker.stats[0]);

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
                    target.activateDefault("frenzy");
                }

                if (curr.weapon && curr.weapon.attackTimes > 0 && curr.weapon.stats[0]) {
                    curr.weapon.remStats(0, 1);
                    curr.weapon.attackTimes -= 1;

                    curr.weapon.activateDefault("onattack");

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

                attacker.activateDefault("onattack");

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
        card.activateDefault("outcast");
    }

    game.playCard(card, curr);
}

function printName(name = false) {
    process.stdout.write('\033c');

    if (!name) return;

    console.log("|-----------------------------|");
    console.log("|       HEARTHSTONE.JS        |");
    console.log("|-----------------------------|");
}

function printAll(curr, detailed = false) {
    if (game.turns <= 2) console.log(`|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n|||                  Hearthstone.js | Copyright (C) ${copyright_year} | Keatpole                  |||\n||| This program is licensed under the GNU-GPL license. To learn more: type 'license' |||\n|||                     This will disppear once you end your turn.                    |||\n|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n`);

    console.log(`Mana: ${curr.getMana()} / ${curr.getMaxMana()} | Opponent's Mana: ${game.opponent.getMana()} / ${game.opponent.getMaxMana()}`);
    console.log(`Health: ${curr.health} + ${curr.armor} / ${curr.maxHealth} | Opponent's Health: ${game.opponent.health} + ${game.opponent.armor} / ${game.opponent.maxHealth}`);

    wpnstr = "";
    if (curr.attack > 0) wpnstr += `Attack: ${curr.attack}`;
    if (wpnstr && curr.weapon) wpnstr += " | ";
    if (curr.weapon) wpnstr += `Weapon: ${curr.weapon.displayName} (${curr.weapon.getStats().join(' / ')})`;
    if (curr.weapon && game.opponent.weapon) wpnstr += " | ";
    if (game.opponent.weapon) wpnstr += `Opponent's Weapon: ${game.opponent.weapon.displayName} (${game.opponent.weapon.getStats().join(' / ')})`;

    if (wpnstr) console.log(wpnstr);

    if (curr.secrets.length > 0)
        console.log(`Secrets: ${curr.secrets.map(x => x["name"]).join(', ')}`);
    if (curr.sidequests.length > 0)
        console.log(`Sidequests: ${curr.sidequests.map(x => x["name"] + " (" + x["progress"][0] + " / " + x["progress"][1] + ")").join(', ')}`);
    if (curr.quests.length > 0)
        console.log(`Quest: ${curr.quests[0]["name"] + " (" + curr.quests[0]["progress"][0] + " / " + curr.quests[0]["progress"][1] + ")"}`);
    if (curr.questlines.length > 0)
        console.log(`Questline: ${curr.questlines[0]["name"] + " (" + curr.questlines[0]["progress"][0] + " / " + curr.questlines[0]["progress"][1] + ")"}\n`);
        
    console.log(`Deck Size: ${curr.getDeck().length} | Opponent's Deck Size: ${game.opponent.getDeck().length}`);

    if (detailed) {
        console.log("-------------------------------");

        if (game.opponent.secrets.length > 0)
            console.log(`Opponent's Secrets: ${game.opponent.secrets.length}`);
        if (game.opponent.sidequests.length > 0)
            console.log(`Opponent's Sidequests: ${game.opponent.sidequests.map(x => x["name"] + " (" + x["progress"][0] + " / " + x["progress"][1] + ")").join(', ')}`);
        if (game.opponent.quests.length > 0)
            console.log(`Opponent's Quest: ${game.opponent.quests[0]["name"] + " (" + game.opponent.quests[0]["progress"][0] + " / " + game.opponent.quests[0]["progress"][1] + ")"}`);
        if (game.opponent.questlines.length > 0)
            console.log(`Opponent's Questline: ${game.opponent.questlines[0]["name"] + " (" + game.opponent.questlines[0]["progress"][0] + " / " + game.opponent.questlines[0]["progress"][1] + ")"}\n`);

        console.log(`Opponent's Hand Size: ${game.opponent.getHand().length}`);
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

    let q = game.input("\nDo you want to view more info, or do you want to go back? [more / back] ");

    if (q.toLowerCase().startsWith("m")) {
        viewMinion(minion, true)
    } else {
        return;
    }
}

let game;

if (!_debug) {
    printName();

    const name1 = game.input("\nPlayer 1, what is your name? ");
    const name2 = game.input("Player 2, what is your name? ");

    printName();
    const passcode1 = game.input(`\nPlayer 1 (${name1}), please enter your passcode: `, {hideEchoBack: true});
    printName();
    const passcode2 = game.input(`\nPlayer 2 (${name2}), please enter your passcode: `, {hideEchoBack: true});

    const player1 = new Player(name1);
    const player2 = new Player(name2);

    player1.passcode = crypto.createHash('sha256').update(passcode1).digest('hex');
    player2.passcode = crypto.createHash('sha256').update(passcode2).digest('hex');

    game = new Game(player1, player2);
} else {
    game = new Game(new Player("Isak"), new Player("Sondre"));
}

game.setup({
    "cards": cards,
    "printName": printName,
    "input": rl.question,
    "Minion": Minion,
    "Spell": Spell,
    "Weapon": Weapon,
    "Hero": Hero,
    "Player": Player
});

setup_card(cards, game);
setup_other(cards, game);

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

function validateDeck(card, plr, deck) {
    if (deck.length > 30) return false;

    return validateCard(card, plr);
}

function validateCard(card, plr) {
    if (plr.class != card.class && card.class != "Neutral") return false;
    return true;
}

function importDeck(code, plr) {
    // The code is base64 encoded, so we need to decode it
    code = Buffer.from(code, 'base64').toString('ascii');
    let deck = code.split(", ");
    let _deck = [];

    let changed_class = false;

    // Find all cards with "x2" in front of them, and remove it and add the card twice
    for (let i = 0; i < deck.length; i++) {
        let card = deck[i];

        let m = null;

        if (card.startsWith("x2 ")) {
            let m1 = createVarFromFoundType(card.substring(3), plr);
            let m2 = createVarFromFoundType(card.substring(3), plr);
            m = m1;

            _deck.push(m1, m2);
        } else {
            m = createVarFromFoundType(card, plr);

            _deck.push(m);
        }

        if (!changed_class) {
            plr.class = m.class;
            plr.hero_power = m.class;
        
            changed_class = true;
        }

        if (!validateDeck(m, plr, _deck)) {
            console.log("The Deck is not valid")
            exit(1);
        }
    }

    return game.functions.shuffle(_deck);
}

printName();

const deckcode1 = game.input("\nPlayer 1, please type in your deckcode (Leave this empty for a test deck): ");
printName();
const deckcode2 = game.input("\nPlayer 2, please type in your deckcode (Leave this empty for a test deck): ");

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