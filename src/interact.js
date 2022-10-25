const { exit } = require('process');

let game = null;
let debug = false;
let maxDeckLength = 30; // Don't change this variable, if you want to change the max deck length, change the variable in index.js

const license_url = 'https://github.com/Keatpole/Hearthstone.js/blob/main/LICENSE';
const copyright_year = "2022";

let curr;

function setup(_game, _debug, _maxDeckLength) {
    game = _game;
    debug = _debug;
    maxDeckLength = _maxDeckLength;
}

const cls = () => process.stdout.write('\033c');

function doTurnAttack() {
    var attacker = game.functions.selectTarget("Which minion do you want to attack with?", false, "self");
    if (!attacker || attacker.frozen || attacker.dormant) return;

    var target = game.functions.selectTarget("Which minion do you want to attack?", false, "enemy");
    if (!target || target.immune || target.dormant) return;

    if (target instanceof game.Player && attacker instanceof game.Card && !attacker.canAttackHero) return;

    // Check if there is a minion with taunt
    var prevent = false;

    game.board[game.opponent.id].forEach(m => {
        if (m.keywords.includes("Taunt") && m != target) {
            prevent = true;
            return;
        }
    });

    if (prevent) return;

    // Attacker is a player
    if (attacker instanceof game.Player) {
        if (attacker.attack <= 0) return;

        // Target is a player
        if (target instanceof game.Player) {
            game.stats.update("enemyAttacks", [attacker, target]);
            game.stats.update("heroAttacks", [attacker, target]);
            game.stats.update("heroAttacked", [attacker, target, game.turns]);

            target.remHealth(attacker.attack);

            attacker.attack = 0;

            if (!attacker.weapon) return;

            const wpn = attacker.weapon;

            if (wpn.attackTimes > 0 && wpn.getAttack()) {
                wpn.attackTimes -= 1;

                wpn.activate("onattack");
                wpn.remStats(0, 1);
            }

            return;
        }

        // Target is a minion

        if (target.keywords.includes("Stealth")) return;

        game.stats.update("minionsAttacked", [attacker, target]);
        game.stats.update("enemyAttacks", [attacker, target]);

        game.attackMinion(attacker.attack, target);
        attacker.remHealth(target.getAttack());

        if (target.getHealth() > 0) {
            target.activate("frenzy");
        }

        if (attacker.weapon) {
            const wpn = attacker.weapon;

            if (wpn.attackTimes > 0 && wpn.getAttack()) {
                wpn.attackTimes -= 1;

                wpn.activate("onattack");
                wpn.remStats(0, 1);

                if (wpn.keywords.includes("Poisonous")) {
                    target.setStats(target.getAttack(), 0);
                }
            }

            attacker.weapon = wpn;
        }

        attacker.attack = 0;

        game.killMinions();

        return;
    }

    // Attacker is a minion
    // Target is a player

    if (attacker.turn == game.turns) {
        console.log("That minion cannot attack this turn!");
        return;
    }
    
    if (attacker.attackTimes <= 0) {
        console.log("That minion has already attacked this turn!");
        return;
    }

    if (target instanceof game.Player) {
        game.stats.update("enemyAttacks", [attacker, target]);
        game.stats.update("heroAttacked", [attacker, target, game.turns]);
        game.stats.update("minionsThatAttacked", [attacker, target]);
        game.stats.update("minionsThatAttackedHero", [attacker, target]);

        if (attacker.keywords.includes("Stealth")) {
            attacker.removeKeyword("Stealth");
        }
    
        if (attacker.keywords.includes("Lifesteal")) {
            attacker.plr.addHealth(attacker.getAttack());
        }

        target.remHealth(attacker.getAttack());

        attacker.attackTimes--;
        return;
    }

    // Target is a minion
    if (target.keywords.includes("Stealth")) return;

    game.attackMinion(attacker, target);
    game.killMinions();
}
function handleCmds(q) {
    if (q === "end") game.endTurn();
    else if (q === "hero power") curr.heroPower();
    else if (q === "attack") {
        doTurnAttack();
        game.killMinions();
    }

    else if (q.startsWith("/give ")) {
        if (!debug) return -1;

        let name = q.split(" ");
        name.shift();
        name = name.join(" ");

        let card = game.functions.getCardByName(name);

        if (!card) return game.input("Invalid card: `" + name + "`.\n");

        game.functions.addToHand(new game.Card(card.name, curr), curr);
    }
    else if (q == "/eval") {
        if (!debug) return -1;

        eval(game.input("\nWhat do you want to evaluate? "));
    }
    else if (q == "/debug") {
        if (!debug) return -1;

        curr.maxMaxMana = 1000;
        curr.maxMana = 1000;
        curr.mana = 1000;

        curr.deck = [];
        curr.hand = [];

        curr.health += 10000;
        curr.armor += 100000;
        curr.fatigue = 0;
    }

    else if (q === "help") {
        printName();
        game.input("\n(In order to run a command; input the name of the command and follow further instruction.)\n\nAvailable commands:\n\nend - Ends your turn\nattack - Attack\nview - View a minion\nhero power - Use your hero power\ndetail - Get more details about opponent\nhelp - Displays this message\nlicense - Opens a link to this project's license\n\nPress enter to continue...");
    }
    else if (q == "view") {
        var minion = game.functions.selectTarget("Which minion do you want to view?", false, null, "minion");

        if (minion === undefined) return -1;

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
    else return -1;
}
function doTurnLogic(input, _ret_on_fail = true) {
    game.killMinions();

    curr = game.player;

    if (handleCmds(input) !== -1) return;
    
    const card = curr.hand[parseInt(input) - 1];
    if (!card) return "Invalid Card";
    if (input == curr.hand.length || input == 1) card.activate("outcast");
    const ret = game.playCard(card, curr);

    game.killMinions();

    if (!!["mana", "space"].filter(s => s == ret).length) return true;
    if (_ret_on_fail) return ret;
}
function doTurn() {
    curr = game.player;

    printName();
    printAll(game.player);

    let input = "\nWhich card do you want to play? ";
    if (game.turns <= 2 && !debug) input += "(type 'help' for further information <- This will disappear once you end your turn) ";

    doTurnLogic(game.input(input), false);
}

function validateDeck(card, plr, deck) {
    if (deck.length > maxDeckLength) return false;
    return validateCard(card, plr);
}
function validateCard(card, plr) {
    if (plr.class != card.class && card.class != "Neutral") return false;
    if (card.uncollectible) return false;
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
            let m1 = new game.Card(game.functions.getCardByName(card.substring(3)).name, plr);
            let m2 = new game.Card(game.functions.getCardByName(card.substring(3)).name, plr);
            m = m1;

            _deck.push(m1, m2);
        } else {
            m = new game.Card(game.functions.getCardByName(card).name, plr);

            _deck.push(m);
        }

        if (!changed_class && m.class != "Neutral") {
            plr.setClass(m.class);
        
            changed_class = true;
        }

        if (!validateDeck(m, plr, _deck)) {
            console.log("The Deck is not valid")
            exit(1);
        }
    }

    return game.functions.shuffle(_deck);
}
function deckCode(plr) {
    printName();

    const deckcode = game.input(`\nPlayer ${plr.id + 1}, please type in your deckcode (Leave this empty for a test deck): `);

    if (deckcode.length > 0) plr.deck = importDeck(deckcode, plr);
    else while (plr.deck.length < 30) plr.deck.push(new game.Card("Sheep", plr));
}

function printName(name = true) {
    cls();

    if (!name) return;

    console.log("|-----------------------------|");
    console.log(`|        HEARTHSTONE.JS       |`);
    console.log("|-----------------------------|\n");
}
function printLicense(disappear = true) {
    if (debug) return;

    cls();

    console.log(`|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||`)
    console.log(`|||                  Hearthstone.js | Copyright (C) ${copyright_year} | Keatpole                   |||`)
    console.log(`||| This program is licensed under the GNU-GPL license. To learn more: type 'license' |||`)
    if (disappear)
    console.log(`|||                     This will disppear once you end your turn.                    |||`)
    console.log(`|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n`);
}
function printAll(curr, detailed = false) {
    if (game.turns <= 2) printLicense();

    let op = curr.getOpponent();

    let sb = "";

    /// Mana
    // Current Player's Mana
    sb += "Mana: ";
    sb += curr.mana;
    sb += " / ";
    sb += curr.maxMana;

    sb += " | ";

    // Opponent's Mana
    sb += "Opponent's Mana: ";
    sb += op.mana;
    sb += " / ";
    sb += curr.maxMana;
    // Mana End
    console.log(sb);
    sb = "";
    
    // Health
    sb += "Health: ";
    sb += curr.health;
    sb += " + ";
    sb += curr.armor;
    sb += " / ";
    sb += curr.maxHealth; // HP + AMR / MAXHP

    sb += " | ";

    // Opponent's Health
    sb += "Opponent's Health: ";
    sb += op.health;
    sb += " + ";
    sb += op.armor;
    sb += " / ";
    sb += op.maxHealth;
    // Health End
    console.log(sb);
    sb = "";

    // Weapon
    if (curr.attack > 0 || curr.weapon) sb += `Attack: ${curr.attack}`; // If you can attack, show the amount you can deal

    if (curr.weapon) {
        // Current player has a weapon

        sb += " | ";
        sb += "Weapon: ";
        sb += curr.weapon.displayName;
        sb += " (";
        sb += curr.weapon.stats.join(' / ');
        sb += ")"; // Attack: 1 | Weapon: Wicked Knife (1 / 1)
        
        if (op.weapon) sb += " | ";
    }

    if (game.opponent.weapon) {
        // Opponent has a weapon

        sb += "Opponent's Weapon: ";
        sb += op.weapon.displayName;
        sb += " (";
        sb += op.weapon.stats.join(' / ');
        sb += ")";
    }

    // Weapon End
    if (sb) console.log(sb);
    sb = "";

    // Secrets
    if (curr.secrets.length > 0) {
        sb += "Secrets: ";
        sb += curr.secrets.map(x => x["name"]).join(', '); // Get all your secret's names
    }
    // Secrets End
    if (sb) console.log(sb);
    sb = "";

    // Sidequests
    if (curr.sidequests.length > 0) {
        sb += "Sidequests: ";
        sb += curr.sidequests.map(secret => {
            secret["name"] +
            " (" + secret["progress"][0] +
            " / " + secret["progress"][1] +
            ")"
        }).join(', ');
    }
    // Sidequests End
    if (sb) console.log(sb);
    sb = "";

    // Quests
    if (curr.quests.length > 0) {
        const quest = curr.quests[0];

        sb += "Quest: ";
        sb += quest["name"]
        sb += " ("
        sb += quest["progress"][0]
        sb += " / "
        sb += quest["progress"][1]
        sb += ")";
    }
    // Quests End
    if (sb) console.log(sb);
    sb = "";

    // Questlines
    if (curr.questlines.length > 0) {
        const questline = curr.questlines[0];

        sb += "Questline: ";
        sb += questline["name"]
        sb += " ("
        sb += questline["progress"][0]
        sb += " / "
        sb += questline["progress"][1]
        sb += ")";
        sb += "\n";
    }
    // Questlines End
    if (sb) console.log(sb);
    sb = "";

    // Deck
    sb += "Deck Size: ";
    sb += curr.deck.length;
    sb += " | ";

    // Opponent's Deck
    sb += "Opponent's Deck Size: ";
    sb += op.deck.length;
    // Deck End
    console.log(sb);
    sb = "";

    // Detailed Info
    if (detailed) {
        console.log("-------------------------------");

        if (op.secrets.length > 0) {
            sb += "Opponent's Secrets: ";
            sb += op.secrets.length;

            sb += "\n";
        }

        if (op.sidequests.length > 0) {
            sb += "Opponent's Sidequests: ";
            sb += op.sidequests.map(sidequest => {
                sidequest["name"] +
                " (" +
                sidequest["progress"][0] +
                " / " +
                sidequest["progress"][1] +
                ")"
            }).join(', ');

            sb += "\n";
        }
        
        if (op.quests.length > 0) {
            const quest = op.quests[0];

            sb += "Opponent's Quest: ";
            sb += quest["name"];
            sb += " (";
            sb += quest["progress"][0];
            sb += " / ";
            sb += quest["progress"][1];
            sb += ")";

            sb += "\n";
        }
        if (op.questlines.length > 0) {
            const questline = op.questlines[0];

            sb += "Opponent's Questline: ";
            sb += questline["name"];
            sb += " (";
            sb += questline["progress"][0];
            sb += " / ";
            sb += questline["progress"][1]
            sb += ")";
            
            sb += "\n";
        }

        sb += "\n";

        sb += "Opponent's Hand Size: ";
        sb += op.hand.length;
    }
    // Detailed Info End
    if (sb) console.log(sb);
    sb = "";

    // Board
    console.log("\n--- Board ---");
    
    game.board.forEach((_, i) => {
        const t = (i == curr.id) ? "--- You ---" : "--- Opponent ---";

        console.log(t) // This is not for debugging, do not comment out

        if (game.board[i].length == 0) {
            console.log("(None)");
            return;
        }

        game.board[i].forEach((m, n) => {
            const keywords = m.keywords.length > 0 ? ` {${m.keywords.join(", ")}}` : "";
            const frozen = m.frozen ? " (Frozen)" : "";
            const immune = m.immune ? " (Immune)" : "";
            const dormant = m.dormant ? " (Dormant)" : "";
            const sleepy = (m.turn >= game.turns - 1) || (m.attackTimes <= 0) ? " (Sleepy)" : "";

            sb += "[";
            sb += n + 1;
            sb += "] ";
            sb += m.displayName;
            sb += " (";
            sb += m.stats.join(" / ")
            sb += ")";

            sb += keywords;
            sb += frozen
            sb += immune
            sb += dormant;
            sb += sleepy;

            console.log(sb);
            sb = "";
        });
    });
    console.log("-------------")

    let _class = (curr.hero == "") ? curr.class : curr.hero.name;
    if (detailed) {
        _class += " | ";
        _class += "HP: ";
        _class += (curr.hero_power == "hero") ? curr.hero.name : curr.hero_power;
    }

    // Hand
    console.log(`\n--- ${curr.name} (${_class})'s Hand ---`);
    console.log("([id] {cost} Name [attack / health] (type))\n");

    curr.hand.forEach((card, i) => {
        const desc = card.desc.length > 0 ? ` (${card.desc}) ` : " ";

        sb += "[";
        sb += i + 1;
        sb += "]";
        sb += " {";
        sb += card.mana;
        sb += "} ";
        sb += card.displayName;
        
        if (card.type === "Minion" || card.type === "Weapon") {
            sb += " [";
            sb += card.stats.join(" / ");
            sb += "]";
        }

        sb += desc;

        sb += "(";
        sb += card.type;
        sb += ")";

        console.log(sb);
        sb = ""
    });
    // Hand End

    console.log("------------");
}
function viewMinion(minion, detailed = false) {
    console.log(`{${minion.mana}} ${minion.displayName} [${minion.blueprint.stats.join(' / ')}]\n`);
    if (minion.desc) console.log(minion.desc + "\n");
    console.log("Tribe: " + minion.tribe);
    console.log("Class: " + minion.class);

    const frozen = minion.frozen;
    const immune = minion.immune;
    const dormant = minion.dormant;

    console.log("Is Frozen: " + frozen);
    console.log("Is Immune: " + immune);
    console.log("Is Dormant: " + dormant);
    if (detailed) {
        console.log("Is Corrupted: " + minion.corrupted);
        console.log("Rarity: " + minion.rarity);
        console.log("Set: " + minion.set);
        console.log("Turn played: " + minion.turn);
    }

    let q = game.input("\nDo you want to view more info, or do you want to go back? [more / back] ");

    if (q.toLowerCase().startsWith("m")) viewMinion(minion, true)
    else return;
}

exports.doTurn = doTurn;
exports.printName = printName;
exports.deckCode = deckCode;

exports.setup_interact = setup;