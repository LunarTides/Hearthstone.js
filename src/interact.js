let game = null;
let debug = false;

const license_url = 'https://github.com/Keatpole/Hearthstone.js/blob/main/LICENSE';
const copyright_year = "2022";

let curr;

function setup(_game, _debug) {
    game = _game;
    debug = _debug;
}

function doTurnAttack() {
    var attacker = game.functions.selectTarget("Which minion do you want to attack with?", false, "self");
    if (!attacker || attacker.frozen) return;

    var target = game.functions.selectTarget("Which minion do you want to attack?", false, "enemy");
    if (!target || target.immune) return;

    if (target instanceof game.Player && attacker instanceof game.Card && !attacker.canAttackHero) return;

    // Check if there is a minion with taunt
    var prevent = false;

    game.getBoard()[game.opponent.id].forEach(m => {
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

            if (wpn.attackTimes > 0 && wpn.stats[0]) {
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
        attacker.remHealth(target.stats[0]);

        if (target.stats[1] > 0) {
            target.activate("frenzy");
        }

        if (attacker.weapon) {
            const wpn = attacker.weapon;

            if (wpn.attackTimes > 0 && wpn.stats[0]) {
                wpn.attackTimes -= 1;

                wpn.activate("onattack");
                wpn.remStats(0, 1);

                if (wpn.keywords.includes("Poisonous")) {
                    target.setStats(target.stats[0], 0);
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

    if (attacker.turn == game.getTurns()) {
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
            attacker.plr.addHealth(attacker.stats[0]);
        }

        target.remHealth(attacker.stats[0]);

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

    curr = game.getPlayer();

    if (handleCmds(input) !== -1) return;
    
    const card = curr.getHand()[parseInt(input) - 1];
    if (!card) return "Invalid Card";
    if (input == curr.hand.length || input == 1) card.activate("outcast");
    const ret = game.playCard(card, curr);

    game.killMinions();

    if (!!["mana", "space"].filter(s => s == ret).length) return true;
    if (_ret_on_fail) return ret;
}

function doTurn() {
    printName();
    printAll(game.getPlayer());

    let input = "\nWhich card do you want to play? ";
    if (game.turns <= 2 && !debug) input += "(type 'help' for further information <- This will disappear once you end your turn) ";

    doTurnLogic(game.input(input), false);
}

const cls = () => process.stdout.write('\033c');

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

    let op = game.getOpponent();

    let sb = "";

    /// Mana
    // Current Player's Mana
    sb += "Mana: ";
    sb += curr.getMana();
    sb += " / ";
    sb += curr.getMaxMana();

    sb += " | ";

    // Opponent's Mana
    sb += "Opponent's Mana: ";
    sb += op.getMana();
    sb += " / ";
    sb += curr.getMaxMana();
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
        sb += curr.weapon.getStats().join(' / ');
        sb += ")"; // Attack: 1 | Weapon: Wicked Knife (1 / 1)
        
        if (op.weapon) sb += " | ";
    }

    if (game.opponent.weapon) {
        // Opponent has a weapon

        sb += "Opponent's Weapon: ";
        sb += op.weapon.displayName;
        sb += " (";
        sb += op.weapon.getStats().join(' / ');
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
    sb += curr.getDeck().length;
    sb += " | ";

    // Opponent's Deck
    sb += "Opponent's Deck Size: ";
    sb += op.getDeck().length;
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
        sb += op.getHand().length;
    }
    // Detailed Info End
    if (sb) console.log(sb);
    sb = "";

    // Board
    console.log("\n--- Board ---");
    
    game.getBoard().forEach((_, i) => {
        const t = (i == curr.id) ? "--- You ---" : "--- Opponent ---";

        console.log(t) // This is not for debugging, do not comment out

        if (game.getBoard()[i].length == 0) {
            console.log("(None)");
            return;
        }

        game.getBoard()[i].forEach((m, n) => {
            const keywords = m.getKeywords().length > 0 ? ` {${m.getKeywords().join(", ")}}` : "";
            const frozen = m.frozen && !m.dormant ? " (Frozen)" : "";
            const immune = m.immune && !m.dormant ? " (Immune)" : "";
            const dormant = m.dormant ? " (Dormant)" : "";

            sb += "[";
            sb += n + 1;
            sb += "] ";
            sb += m.displayName;
            sb += " (";
            sb += m.getStats().join(" / ")
            sb += ")";

            sb += keywords;
            sb += frozen
            sb += immune
            sb += dormant;

            console.log(sb);
            sb = "";
        });
    });
    console.log("-------------")

    let _class = (curr.hero == "") ? curr.class : curr.hero.getName();
    if (detailed) {
        _class += " | ";
        _class += "HP: ";
        _class += (curr.hero_power == "hero") ? curr.hero.getName() : curr.hero_power;
    }

    // Hand
    console.log(`\n--- ${curr.getName()} (${_class})'s Hand ---`);
    console.log("([id] {cost} Name [attack / health] (type))\n");

    curr.getHand().forEach((card, i) => {
        const desc = card.getDesc().length > 0 ? ` (${card.getDesc()}) ` : " ";

        sb += "[";
        sb += i + 1;
        sb += "]";
        sb += " {";
        sb += card.getMana();
        sb += "} ";
        sb += card.displayName;
        
        if (card.getType() === "Minion" || card.getType() === "Weapon") {
            sb += " [";
            sb += card.getStats().join(" / ");
            sb += "]";
        }

        sb += desc;

        sb += "(";
        sb += card.getType();
        sb += ")";

        console.log(sb);
        sb = ""
    });
    // Hand End

    console.log("------------");
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

    if (q.toLowerCase().startsWith("m")) viewMinion(minion, true)
    else return;
}

exports.doTurn = doTurn;
exports.doTurnLogic = doTurnLogic
exports.printName = printName;

exports.setup_interact = setup;