const colors = require("colors");
const { exit } = require('process');

const license_url = 'https://github.com/Keatpole/Hearthstone.js/blob/main/LICENSE';
const copyright_year = "2022";

let game;
let curr;

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

        if (curr.ai) {
            let ai = curr.ai.chooseBattle();

            if (ai.includes(-1)) return -1;
            if (ai.includes(null)) return null;

            attacker = ai[0];
            target = ai[1];
        } else {
            attacker = game.functions.selectTarget("Which minion do you want to attack with?", false, "self");
            if (!attacker) return;

            target = game.functions.selectTarget("Which minion do you want to attack?", false, "enemy");
            if (!target) return;
        }
    
        let errorcode = game.attack(attacker, target);
        game.killMinions();

        let ignore = ["divineshield"];
        if (errorcode === true || ignore.includes(errorcode)) return errorcode;
        let err;

        switch (errorcode) {
            case "taunt":
                err = "There is a minion with taunt in the way";
                break;
            case "stealth":
                err = "That minion has stealth";
                break;
            case "frozen":
                err = "That minion is frozen";
                break;
            case "plrnoattack":
                err = "You don't have any attack";
                break;
            case "noattack":
                err = "This minion has no attack";
                break;
            case "hasattacked":
                err = "This minion has already attacked this turn";
                break;
            case "sleepy":
                err = "This minion is exhausted";
                break;
            case "cantattackhero":
                err = "This minion cannot attack heroes";
                break;
            default:
                err = "An unknown error occurred. Error code: 19";
                break;
        }

        console.log(`${err}.`.red);
        game.input();
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
            let errorcode = this.useLocation();
            game.killMinions();

            if (errorcode === true || curr.ai) return true;
            let err;

            switch (errorcode) {
                case "nolocations":
                    err = "You have no location cards";
                    break;
                case "invalidtype":
                    err = "That card is not a location card";
                    break;
                case "cooldown":
                    err = "That location is on cooldown";
                    break;
                default:
                    err = "An unknown error occourred. Error code: 51";
                    break;
            }

            console.log(`${err}.`.red);
            game.input();
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
            if (!minion) return -1;
    
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
            if (!game.config.debug) return -1;
    
            let name = q.split(" ");
            name.shift();
            name = name.join(" ");
    
            let card = game.functions.getCardByName(name);
            if (!card) return game.input("Invalid card: `" + name + "`.\n");
    
            curr.addToHand(new game.Card(card.name, curr));
        }
        else if (q == "/eval") {
            if (!game.config.debug) return -1;
    
            eval(game.input("\nWhat do you want to evaluate? "));
        }
        else if (q == "/debug") {
            if (!game.config.debug) return -1;
    
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
            if (!game.config.debug) return -1;

            console.log("AI Info:\n");

            for (let i = 1; i <= 2; i++) {
                const plr = game["player" + i];
                if (!plr.ai) continue;

                console.log(`AI${i} History: {`);

                plr.ai.history.forEach((t, j) => {
                    console.log(`${j + 1} ${t[0]}: (${t[1]}),`);
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
    
        if (this.handleCmds(input) !== -1) return true;
        let card = curr.hand[parseInt(input) - 1];
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

        if (curr.ai) {
            let input = curr.ai.calcMove();
            if (!input) return;
            if (input instanceof game.Card) input = (curr.hand.indexOf(input) + 1).toString();

            let turn = this.doTurnLogic(input);

            game.killMinions();

            return turn;
        }

        this.printName();
        this.printAll(curr);
    
        let input = "\nWhich card do you want to play? ";
        if (game.turns <= 2 && !game.config.debug) input += "(type 'help' for further information <- This will disappear once you end your turn) ";
    
        const ret = this.doTurnLogic(game.input(input));
        game.killMinions();

        if (ret === true || ret instanceof game.Card) return ret; // If there were no errors, return true.
        if (["refund", "magnetize"].includes(ret)) return ret; // Ignore these error codes
        let err;

        // Error Codes
        if (ret == "mana") err = "Not enough mana";
        else if (ret == "counter") err = "Your card has been countered";
        else if (ret == "space") err = `You can only have ${game.config.maxBoardSpace} minions on the board`;
        else if (ret == "invalid") err = "Invalid card";
        else err = "An unknown error occurred";

        console.log(`${err}.`.red);
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
        if (locations.length <= 0) return "nolocations";

        let location = game.functions.selectTarget("Which location do you want to use?", false, "self", "minion", ["allow_locations"]);
        if (location.type != "Location") return "invalidtype";
        if (location.cooldown > 0) return "cooldown";
        
        if (location.activate("use") === -1) return -1;
        
        location.remStats(0, 1);
        location.cooldown = location.backups.cooldown;
        return true;
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

        if (deck.length > game.config.maxDeckLength) return false;
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

        if (plr.heroClass != card.class && card.class != "Neutral") return false;
        if (card.uncollectible) return false;
        return true;
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
    
        if (deckcode.length > 0) game.functions.importDeck(plr, deckcode);
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
        if (!game.config.debug) sb += "(Example: 13 will mulligan your left and right most cards, 123 will mulligan your 3 leftmost cards, just pressing enter will not mulligan any cards):\n";

        let input;

        if (plr.ai) input = plr.ai.mulligan();
        else input = game.input(sb);

        game.functions.mulligan(plr, input);

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

        if (game.config.debug) return;
    
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
    
        console.log("Your side  :                              | Your opponent's side".gray);
        /// Mana
        // Current Player's Mana
        sb += "Mana       : ";
        sb += `${curr.mana}`.cyan;
        sb += " / ";
        sb += `${curr.maxMana}`.cyan;
    
        sb += "                        | ";
    
        // Opponent's Mana
        sb += "Mana: ";
        sb += `${op.mana}`.cyan;
        sb += " / ";
        sb += `${curr.maxMana}`.cyan;
        // Mana End
        console.log(sb);
        sb = "";
        
        // Health
        sb += "Health     : ";
        sb += `${curr.health}`.red;
        sb += " (";
        sb += `${curr.armor}`.gray;
        sb += ") / ";
        sb += `${curr.maxHealth}`.red; // HP + AMR / MAXHP

        sb += "                  | ";
    
        // Opponent's Health
        sb += "Health: ";
        sb += `${op.health}`.red;
        sb += " (";
        sb += `${op.armor}`.gray;
        sb += ") / ";
        sb += `${op.maxHealth}`.red;
        // Health End
        console.log(sb);
        sb = "";
    
        // Weapon
        if (curr.weapon) {
            // Current player has a weapon
            // Attack: 1 | Weapon: Wicked Knife (1 / 1)
            sb += "Weapon     : ";
            sb += `${curr.weapon.displayName} `.bold;

            let wpnStats = `[${curr.weapon.stats.join(' / ')}]`;

            sb += (curr.attack > 0) ? `${wpnStats}`.brightGreen : `${wpnStats}`.gray;
        }
    
        if (op.weapon) {
            // Opponent has a weapon
            if (!curr.weapon) sb += "                                "; // Show that this is the opponent's weapon, not yours
            sb += "         | "; 
            sb += "Weapon: ";
            sb += `${op.weapon.displayName} `.bold;
            let opWpnStats = `[${op.weapon.stats.join(' / ')}]`;

            sb += (op.attack > 0) ? `${opWpnStats}`.brightGreen : `${opWpnStats}`.gray;
        }
    
        // Weapon End
        if (sb) console.log(sb);
        sb = "";
    
        // Deck
        sb += "Deck Size  : ";
        sb += `${curr.deck.length}`.yellow;

        sb += "                           | ";
    
        // Opponent's Deck
        sb += "Deck Size: ";
        sb += `${op.deck.length}`.yellow;
        // Deck End
        console.log(sb);
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
            sb += ` [${quest["progress"][0]} / ${quest["progress"][1]}]`.brightGreen;
        }
        // Quests End
        if (sb) console.log(sb);
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
    
            if (sb) sb += "\n";
    
            sb += "Opponent's Hand Size: ";
            sb += `${op.hand.length}`.yellow;
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
                console.log("(None)".gray);
                return;
            }
    
            game.board[i].forEach((m, n) => {
                if (m.type == "Location") {            
                    sb += `[${n + 1}] `;
                    sb += `${m.displayName} `.bold;
                    sb += "{";
                    sb += "Durability: ".brightGreen;
                    sb += `${m.getHealth()}`.brightGreen;
                    sb += " / ".brightGreen;
                    sb += `${m.backups.stats[1]}`.brightGreen;
                    sb += ", ";
        
                    sb += "Cooldown: ".cyan;
                    sb += `${m.cooldown}`.cyan;
                    sb += " / ".cyan;
                    sb += `${m.backups.cooldown}`.cyan;
                    sb += "}";

                    sb += " [Location]".yellow;
        
                    console.log(sb);
                    sb = "";

                    return;
                }

                const excludedKeywords = ["Magnetic", "Corrupt", "Corrupted"];
                let keywords = m.keywords.filter(k => !excludedKeywords.includes(k));
                keywords = keywords.length > 0 ? ` {${keywords.join(", ")}}`.gray : "";

                let frozen = m.frozen ? " (Frozen)".gray : "";
                let dormant = m.dormant ? " (Dormant)".gray : "";
                let immune = m.immune ? " (Immune)".gray : "";
                let sleepy = (m.sleepy) || (m.attackTimes <= 0) ? " (Sleepy)".gray : "";
    
                sb += `[${n + 1}] `;
                sb += `${m.displayName} `.bold;
                sb += `[${m.stats.join(" / ")}]`.brightGreen;
    
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
    
        let _class = curr.hero.name.includes("Starting Hero") ? curr.heroClass : curr.hero.name;
        if (detailed && curr.hero.name.includes("Starting Hero")) {
            _class += " | ";
            _class += "HP: ";
            _class += curr.hero.name;
        }
    
        // Hand
        console.log(`\n--- ${curr.name} (${_class})'s Hand ---`);
        console.log("([id] " + "{Cost}".cyan + " Name".bold + " [attack / health]".brightGreen + " (type)".yellow + ")\n");
    
        curr.hand.forEach((card, i) => {
            const desc = card.desc.length > 0 ? `(${card.desc}) ` : " ";
    
            sb += `[${i + 1}] `;
            sb += `{${card.mana}} `.cyan;
            sb += `${card.displayName} `.bold;
            
            if (card.type === "Minion" || card.type === "Weapon") {
                sb += `[${card.stats.join(" / ")}]`.brightGreen;
            }
    
            sb += desc;
            sb += `(${card.type})`.yellow;

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
