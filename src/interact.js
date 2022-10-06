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

    if (attacker instanceof game.Card && !attacker.canAttackHero) return;

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

            if (attacker.weapon) {
                const wpn = attacker.weapon;

                if (wpn.attackTimes > 0 && wpn.stats[0]) {
                    wpn.attackTimes -= 1;

                    wpn.activateDefault("onattack");
                    wpn.remStats(0, 1);
                }

                attacker.weapon = wpn;
            }

            attacker.attack = 0;

            return;
        }

        // Target is a minion

        if (target.keywords.includes("Stealth")) return;

        game.stats.update("minionsAttacked", [attacker, target]);
        game.stats.update("enemyAttacks", [attacker, target]);

        game.attackMinion(attacker.attack, target);
        attacker.remHealth(target.stats[0]);

        if (target.stats[1] > 0) {
            target.activateDefault("frenzy");
        }

        if (attacker.weapon) {
            const wpn = attacker.weapon;

            if (wpn.attackTimes > 0 && wpn.stats[0]) {
                wpn.attackTimes -= 1;

                wpn.activateDefault("onattack");
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
        return;
    }

    // Target is a minion
    if (target.keywords.includes("Stealth")) return;

    if (attacker.keywords.includes("Stealth")) {
        attacker.removeKeyword("Stealth");
    }

    if (attacker.keywords.includes("Lifesteal")) {
        attacker.plr.addHealth(attacker.stats[0]);
    }

    game.attackMinion(attacker, target);
    game.killMinions();
}

function handleCmds(q) {
    if (q === "hero power") curr.heroPower();

    else if (q.startsWith("/give ")) {
        if (!debug) return -1;

        let name = q.split(" ");
        name.shift();
        name = name.join(" ");

        let card = game.functions.getCardByName(name);

        game.functions.addToHand(new game.Card(card.name, curr), curr);
    }
    else if (q == "/eval") {
        if (!debug) return -1;

        eval(game.input("\nWhat do you want to evaluate? "));
    }

    else if (q === "end") {
        game.endTurn();
        game.startTurn();
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
    else if (q === "attack") {
        doTurnAttack();
        game.killMinions();
    }
    else return -1;
}

function doTurnLogic(input, _ret_on_fail = true) {
    game.killMinions();

    curr = game.getPlayer();

    if (handleCmds(input) !== -1) return;
    
    const card = curr.getHand()[parseInt(input) - 1];
    if (!card) return "Invalid Card";
    if (input == curr.hand.length || input == 1) card.activateDefault("outcast");
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

exports.doTurn = doTurn;
exports.doTurnLogic = doTurnLogic
exports.printName = printName;

exports.setup_interact = setup;