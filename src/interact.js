const { exit } = require('process');

const license_url = 'https://github.com/Keatpole/Hearthstone.js/blob/main/LICENSE';
const copyright_year = "2022";

let curr;
let game;

class Interact {
    constructor(_game) {
        game = _game;
    }

    // Constant interaction
    doTurnAttack() {
        /**
         * Asks the user to attack a minion or hero
         * 
         * @returns {undefined}
         */

        let attacker, target;

        if (game.player.is_ai) {
            let ai = game.player.ai.chooseBattle();

            if (ai[0] === -1) return false;

            attacker = ai[0];
            target = ai[1];
        } else {
            attacker = game.functions.selectTarget("Which minion do you want to attack with?", false, "self");
            if (!attacker || attacker.frozen || attacker.dormant) return;
            
            target = game.functions.selectTarget("Which minion do you want to attack?", false, "enemy");
            if (!target || target.immune || target.dormant) return;
        }
    
        if (target instanceof game.Player && attacker instanceof game.Card && !attacker.canAttackHero) return;
    
        // Check if there is a minion with taunt
        let taunts = game.board[game.opponent.id].filter(m => m.keywords.includes("Taunt"));
        if (taunts.length > 0) {
            // If the target is a card and has taunt, you are allowed to attack it
            if (target instanceof game.Card && target.keywords.includes("Taunt")) {}
            else return false;
        }
    
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
    
            game.functions.attackMinion(attacker.attack, target);
            attacker.remHealth(target.getAttack());
    
            if (target.getHealth() > 0) {
                if (target.activate("frenzy") !== -1) target.setFunction("frenzy", () => {}, false);
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

        if (attacker.attackTimes <= 0) {
            game.input("That minion has already attacked this turn!\n");
            return;
        }
    
        if (attacker.sleepy) {
            game.input("That minion cannot attack this turn!\n");
            return;
        }

        if (attacker.getAttack() <= 0) return false;
    
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
            attacker.sleepy = true;
            return;
        }
    
        // Target is a minion
        if (target.keywords.includes("Stealth")) return;
    
        game.functions.attackMinion(attacker, target);
        game.killMinions();
    }
    handleCmds(q) {
        /**
         * Checks if "q" is a command, if it is, do something, if not return -1
         * 
         * @returns {undefined} | -1
         */

        if (q === "end") game.endTurn();
        else if (q === "hero power") curr.heroPower();
        else if (q === "attack") {
            this.doTurnAttack();
            game.killMinions();
        }
        else if (q === "use") {
            // Use location
            this.useLocation();
            game.killMinions();
        }
        else if (q === "help") {
            this.printName();
            console.log("(In order to run a command; input the name of the command and follow further instruction.)\n");
            console.log("Available commands:");
            console.log("(name)     - (description)\n");

            console.log("end        - Ends your turn");
            console.log("attack     - Attack");
            console.log("view       - View a minion");
            console.log("hero power - Use your hero power");
            console.log("use        - Use a location card");
            console.log("detail     - Get more details about opponent");
            console.log("help       - Displays this message");
            console.log("license    - Opens a link to this project's license");
            
            game.input("\nPress enter to continue...\n");
        }
        else if (q == "view") {
            let minion = game.functions.selectTarget("Which minion do you want to view?", false, null, "minion");
    
            if (minion === undefined) return -1;
    
            this.viewMinion(minion);
        }
        else if (q == "detail") {
            this.printName();
            this.printAll(curr, true);
    
            game.input("Press enter to continue...\n");
    
            this.printName();
            this.printAll(curr);
        }
        else if (q == "license") {
            let start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
            require('child_process').exec(start + ' ' + license_url);
        }

        else if (q.startsWith("/give ")) {
            if (!game.constants.debug) return -1;
    
            let name = q.split(" ");
            name.shift();
            name = name.join(" ");
    
            let card = game.functions.getCardByName(name);
    
            if (!card) return game.input("Invalid card: `" + name + "`.\n");
    
            curr.addToHand(new game.Card(card.name, curr));
        }
        else if (q == "/eval") {
            if (!game.constants.debug) return -1;
    
            eval(game.input("\nWhat do you want to evaluate? "));
        }
        else if (q == "/debug") {
            if (!game.constants.debug) return -1;
    
            curr.maxMaxMana = 1000;
            curr.maxMana = 1000;
            curr.mana = 1000;
    
            curr.deck = [];
            curr.hand = [];
    
            curr.health += 10000;
            curr.armor += 100000;
            curr.fatigue = 0;
        }
        else if (q == "/ai") {
            if (!game.constants.debug) return -1;

            console.log("AI Info:\n");

            for (let i = 0; i < 2; i++) {
                const plr = game["player" + (i + 1)];
                if (!plr.is_ai) continue;

                console.log(`AI${i} History: {`);

                plr.ai.history.forEach((t, i) => {
                    let sb = `${i} ${t[0]}: (`;

                    if (t[1] instanceof Array) {
                        if (t[1][0] instanceof game.Card) sb += t[1][0].name;
                        else sb += t[1][0];

                        sb += ", ";

                        if (t[1][1] instanceof game.Card) sb += t[1][1].name;
                        else sb += t[1][1];

                        console.log(`${sb}),`);
                        return;
                    }

                    if (t[1] instanceof game.Card) sb += t[1].name;
                    else sb += t[1];

                    console.log(sb + "),");
                });
                
                console.log("}");
            }

            game.input("\nPress enter to continue...");
        }

        else return -1;
    }
    doTurnLogic(input) {
        /**
         * Takes the input and checks if it is a command, if it is not, play the card with the id of input parsed into a number
         * 
         * @param {string} input The user input
         * 
         * @returns {boolean | string | Card} true | "invalid" | The return value of game.playCard
         */

        game.killMinions();
    
        curr = game.player;
    
        if (typeof input === "string" && this.handleCmds(input) !== -1) return true;

        let card = curr.hand[parseInt(input) - 1];
        if (input instanceof game.Card) card = input;

        if (!card) return "invalid";
        
        if (input == curr.hand.length || input == 1) card.activate("outcast");
        
        return game.playCard(card, curr);    
    }
    doTurn() {
        /**
         * Show information and asks the user for an input which is put into doTurnLogic
         * 
         * @returns {boolean | string | Card} Success | The return value of doTurnLogic
         */

        curr = game.player;
    
        if (curr.is_ai) {
            let input = curr.ai.calcMove();
            if (!input) return;

            let turn = this.doTurnLogic();

            game.killMinions();

            return turn;
        }

        this.printName();
        this.printAll(curr);
    
        let input = "\nWhich card do you want to play? ";
        if (game.turns <= 2 && !game.constants.debug) input += "(type 'help' for further information <- This will disappear once you end your turn) ";
    
        const ret = this.doTurnLogic(game.input(input));
        game.killMinions();

        if (ret === true || ret instanceof game.Card) return ret; // If there were no errors, return true.

        // Error Codes
        if (ret == "mana") console.log("Not enough mana.");
        else if (ret == "counter") console.log("Your card has been countered.");
        else if (ret == "space") console.log(`You can only have ${game.constants.maxBoardSpace} minions on the board.`)
        else if (ret == "invalid") console.log("Invalid card.");
        else console.log("An unknown error occurred.");

        game.input();

        return false;
    }
    useLocation() {
        /**
         * Asks the user to select a location card to use, and activate it.
         * 
         * @return (boolean) Success
         */

        let locations = game.board[curr.id].filter(m => m.type == "Location");
        if (locations.length <= 0) return false;

        let location = game.functions.selectTarget("Which location do you want to use?", false, "self", "minion", ["allow_locations"]);
        if (location.type != "Location") return false;
        
        if (location.cooldown <= 0) {
            if (location.activate("use") === -1) return -1;
            location.remStats(0, 1);
            location.cooldown = location.backups.cooldown;
            return true;
        }

        return false;
    }

    // Deck stuff
    validateDeck(card, plr, deck) {
        /**
         * Validate a deck
         * 
         * @param {Card} card This gets passed into validateCard
         * @param {Player} plr This gets passed into validateCard
         * @param {Card[]} deck The deck of the player
         * 
         * @returns {boolean} Valid
         */

        if (deck.length > game.constants.maxDeckLength) return false;
        return this.validateCard(card, plr);
    }
    validateCard(card, plr) {
        /**
         * Checks if a card is a valid card to put into a players deck
         * 
         * @param {Card} card The card to check
         * @param {Player} plr The player to check against
         * 
         * @returns {boolean} Valid
         */

        if (plr.class != card.class && card.class != "Neutral") return false;
        if (card.uncollectible) return false;
        return true;
    }
    importDeck(code, plr) {
        /**
         * Imports a deck using a code and put the cards into the player's deck
         * 
         * @param {string} code The base64 encoded deck code
         * @param {Player} plr The player to put the cards into
         * 
         * @returns {Card[]} The deck
         */

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
    
            if (!this.validateDeck(m, plr, _deck)) {
                game.input("The Deck is not valid.\n")
                exit(1);
            }
        }
    
        return game.functions.shuffle(_deck);
    }
    deckCode(plr) {
        /**
         * Asks the player to supply a deck code, if no code was given, fill the players deck with 30 Sheep
         * 
         * @param {Player} plr The player to ask
         * 
         * @returns {undefined}
         */

        this.printName();
    
        const deckcode = game.input(`Player ${plr.id + 1}, please type in your deckcode (Leave this empty for a test deck): `);
    
        if (deckcode.length > 0) plr.deck = this.importDeck(deckcode, plr);
        else while (plr.deck.length < 30) plr.deck.push(new game.Card("Sheep", plr));
    }
    mulligan(plr) {
        /**
         * Asks the player to mulligan their cards
         * 
         * @param {Player} plr The player to ask
         * 
         * @returns {string} A string of the indexes of the cards the player mulligan'd
         */

        this.printName();

        let sb = "Your hand is: [ ";

        plr.hand.forEach(c => {
            if (c.name == "The Coin") return;

            sb += c.displayName + ", ";
        });

        sb = sb.slice(0, -2) + " ]\n";
        sb += "Choose the cards to mulligan (1, 2, 3, ...):\n";
        if (!game.constants.debug) sb += "(Example: 13 will mulligan your left and right most cards, 123 will mulligan your 3 leftmost cards, just pressing enter will not mulligan any cards):\n";

        let input;

        if (plr.is_ai) input = plr.ai.mulligan();
        else input = game.input(sb);

        input.split("").forEach(c => {
            let ic = parseInt(c) - 1;
            let card = plr.hand[ic];

            if (card.name == "The Coin") return;

            plr.drawCard();
            plr.shuffleIntoDeck(card, false);
            plr.removeFromHand(card);
        });

        return input;
    }

    // Print game information
    printName(name = true) {
        /**
         * Prints the "watermark" border
         * 
         * @param {boolean} name [default=true] If the watermark border should appear, if this is false, just clear the screen
         * 
         * @returns {undefined}
         */

        cls();
    
        if (!name) return;
    
        console.log("|-----------------------------|");
        console.log(`|        HEARTHSTONE.JS       |`);
        console.log("|-----------------------------|\n");
    }
    printLicense(disappear = true) {
        /**
         * Prints some license info
         * 
         * @param {boolean} disappear [default=true] If this is true, "This will disappear once you end your turn" will show up.
         * 
         * @returs undefined
         */

        if (game.constants.debug) return;
    
        cls();
    
        console.log(`|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||`)
        console.log(`|||                  Hearthstone.js | Copyright (C) ${copyright_year} | Keatpole                   |||`)
        console.log(`||| This program is licensed under the GNU-GPL license. To learn more: type 'license' |||`)
        if (disappear)
        console.log(`|||                     This will disappear once you end your turn.                   |||`)
        console.log(`|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n`);
    }
    printAll(curr, detailed = false) {
        /**
         * Prints all the information you need to understand the game state
         * 
         * @param {Player} curr The current player
         * @param {boolean} detailed [default=false] Show more, less important, information
         * 
         * @returns {undefined}
         */

        if (game.turns <= 2) this.printLicense();
    
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
    
        if (op.weapon) {
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
    
            sb += "Quest(line): ";
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
    
                sb += "Opponent's Quest(line): ";
                sb += quest["name"];
                sb += " (";
                sb += quest["progress"][0];
                sb += " / ";
                sb += quest["progress"][1];
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
                if (m.type == "Location") {            
                    sb += "[";
                    sb += n + 1;
                    sb += "] ";
                    sb += m.displayName;
                    sb += " {Durability: ";
                    sb += m.getHealth();
                    sb += " / ";
                    sb += m.backups.stats[1];
                    sb += ", ";
        
                    sb += "Cooldown: ";
                    sb += m.cooldown;
                    sb += " / ";
                    sb += m.backups.cooldown;
                    sb += "}";

                    sb += " [Location]";
        
                    console.log(sb);
                    sb = "";

                    return;
                }

                let keywords = m.keywords.length > 0 ? ` {${m.keywords.join(", ")}}` : "";
                let frozen = m.frozen ? " (Frozen)" : "";
                let dormant = m.dormant ? " (Dormant)" : "";
                let immune = m.immune ? " (Immune)" : "";
                let sleepy = (m.sleepy) || (m.attackTimes <= 0) ? " (Sleepy)" : "";
    
                sb += "[";
                sb += n + 1;
                sb += "] ";
                sb += m.displayName;
                sb += " (";
                sb += m.stats.join(" / ")
                sb += ")";
    
                sb += keywords;
                sb += frozen
                sb += dormant;
                sb += immune
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
    viewMinion(minion) {
        /**
         * View information about a minion.
         * 
         * @param {Card} minion The minion to show information about
         */

        console.log(`{${minion.mana}} ${minion.displayName} [${minion.blueprint.stats.join(' / ')}]\n`);
        if (minion.desc) console.log(minion.desc + "\n");
        console.log("Tribe: " + minion.tribe);
        console.log("Class: " + minion.class);
        console.log("Rarity: " + minion.rarity);
        console.log("Set: " + minion.set);
        console.log("Turn played: " + minion.turn);
    
        game.input("\nPress enter to continue...\n");
    
        return;
    }
}

const cls = () => process.stdout.write('\033c');

exports.Interact = Interact;
