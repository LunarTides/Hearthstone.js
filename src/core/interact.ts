/**
 * Interact stuff.
 * @module Interact
 */
import { AI, Card, Player } from '../internal.js';
import { AIHistory, CardLike, EventValue, GameConfig, GamePlayCardReturn, SelectTargetAlignment, SelectTargetClass, SelectTargetFlag, Target } from '../types.js';
import { reloadCards } from '../helper/cards.js';

const license_url = 'https://github.com/LunarTides/Hearthstone.js/blob/main/LICENSE';
let game = globalThis.game;

export const interact = {
    // Constant interaction
    /**
     * Asks the user to attack a minion or hero
     *
     * @returns Cancel | Success
     */
    doTurnAttack(): -1 | null | boolean | Card {
        game = globalThis.game;

        let attacker, target;

        if (game.player.ai) {
            let ai;

            let alt_model = `legacy_attack_${game.config.ai.attackModel}`;

            // Run the correct ai attack model
            let model = game.player.ai[alt_model as keyof AI];
            if (model) ai = (model as Function)();

            // Use the latest model
            else ai = game.player.ai.attack();

            attacker = ai[0];
            target = ai[1];

            if (attacker === -1 || target === -1) return -1;
            if (attacker === null || target === null) return null;
        } else {
            attacker = this.selectTarget("Which minion do you want to attack with?", null, "friendly", "any");
            if (!attacker) return false;

            target = this.selectTarget("Which minion do you want to attack?", null, "enemy", "any");
            if (!target) return false;
        }
    
        let errorcode = game.attack(attacker, target);
        game.killMinions();

        let ignore = ["divineshield"];
        if (errorcode === true || ignore.includes(errorcode)) return true;
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
                err = "That minion has no attack";
                break;
            case "plrhasattacked":
                err = "Your hero has already attacked this turn";
                break;
            case "hasattacked":
                err = "That minion has already attacked this turn";
                break;
            case "sleepy":
                err = "That minion is exhausted";
                break;
            case "cantattackhero":
                err = "That minion cannot attack heroes";
                break;
            case "immune":
                err = "That minion is immune";
                break;
            case "dormant":
                err = "That minion is dormant";
                break;
            default:
                err = `An unknown error occurred. Error code: UnexpectedAttackingResult@${errorcode}`;
                break;
        }

        game.log(`<red>${err}.</red>`);
        game.input();
        return false;
    },

    /**
     * Checks if "q" is a command, if it is, do something, if not return -1
     * 
     * @param q The command
     * @param echo If this is false, it doesn't log information to the screen. Only used by "history", "/ai"
     * @param debug If this is true, it does some additional, debug only, things. Only used by "history"
     * 
     * @returns A string if "echo" is false
     */
    handleCmds(q: string, echo: boolean = true, debug: boolean = false): boolean | string | -1 {
        game = globalThis.game;

        let args = q.split(" ");
        let name = args.shift()?.toLowerCase();
        if (!name) {
            game.input("<red>Invalid command.</red>\n");
            return false;
        }

        if (name === "end") game.endTurn();
        else if (q === "hero power") {
            if (game.player.ai) {
                game.player.heroPower();
                return true;
            }

            if (game.player.mana < game.player.heroPowerCost) {
                game.input("<red>You do not have enough mana.</red>\n");
                return false;
            }

            if (!game.player.canUseHeroPower) {
                game.input("<red>You have already used your hero power this turn.</red>\n");
                return false;
            }

            this.printAll(game.player);
            let ask = this.yesNoQuestion(game.player, `<yellow>${game.player.hero?.hpDesc}</yellow> Are you sure you want to use this hero power?`);
            if (!ask) return false;

            this.printAll(game.player);
            game.player.heroPower();
        }
        else if (name === "attack") {
            this.doTurnAttack();
            game.killMinions();
        }
        else if (name === "use") {
            // Use location
            let errorcode = this.useLocation();
            game.killMinions();

            if (errorcode === true || errorcode === -1 || game.player.ai) return true;
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
                    err = `An unknown error occourred. Error code: UnexpectedUseLocationResult@${errorcode}`;
                    break;
            }

            game.log(`<red>${err}.</red>`);
            game.input();
        }
        else if (name === "help") {
            this.printName();
            game.log("(In order to run a command; input the name of the command and follow further instruction.)\n");
            game.log("Available commands:");
            game.log("(name)     - (description)\n");

            game.log("end        - Ends your turn");
            game.log("attack     - Attack");
            game.log("hero power - Use your hero power");
            game.log("history    - Displays a history of actions");
            game.log("concede    - Forfeits the game");
            game.log("view       - View a minion");
            game.log("use        - Use a location card");
            game.log("detail     - Get more details about opponent");
            game.log("help       - Displays this message");
            game.log("version    - Displays the version, branch, your settings preset, and some information about your current version.");
            game.log("license    - Opens a link to this project's license");

            const cond_color = (str: string) => {return (game.config.general.debug) ? str : `<gray>${str}</gray>`};

            game.log(cond_color("\n--- Debug Commands (") + ((game.config.general.debug) ? "<bright:green>ON</bright:green>" : "<red>OFF</red>") + cond_color(") ---"));
            game.log(cond_color("/give (name)        - Adds a card to your hand"));
            game.log(cond_color("/eval [log] (code)  - Runs the code specified. If the word 'log' is before the code, instead game.log the code and wait for user input to continue."));
            game.log(cond_color("/set (name) (value) - Changes a setting to (value). Look in the config files for a list of settings."));
            game.log(cond_color("/debug              - Gives you infinite mana, health and armor"));
            game.log(cond_color("/exit               - Force exits the game. There will be no winner, and it will take you straight back to the runner."));
            game.log(cond_color("/history            - Displays a history of actions. This doesn't hide any information, and is the same thing the log files uses."));
            game.log(cond_color("/reload | /rl       - Reloads the cards and config in the game (Use '/freload' or '/frl' to ignore the confirmation prompt (or disable the prompt in the advanced config))"));
            game.log(cond_color("/undo               - Undoes the last card played. It gives the card back to your hand, and removes it from where it was. (This does not undo the actions of the card)"));
            game.log(cond_color("/cmd                - Shows you a list of debug commands you have run, and allows you to rerun them."));
            game.log(cond_color("/ai                 - Gives you a list of the actions the ai(s) have taken in the order they took it"));
            game.log(cond_color("---------------------------" + ((game.config.general.debug) ? "" : "-")));
            
            game.input("\nPress enter to continue...\n");
        }
        else if (name === "view") {
            let isHandAnswer = this.question(game.player, "Do you want to view a minion on the board, or in your hand?", ["Board", "Hand"]);
            let isHand = isHandAnswer == "Hand";

            if (!isHand) {
                // allow_locations Makes selecting location cards allowed. This is disabled by default to prevent, for example, spells from killing the card.
                let minion = this.selectCardTarget("Which minion do you want to view?", null, "any", ["allow_locations"]);
                if (!minion) return false;
        
                this.viewCard(minion);

                return true;
            }

            // View minion on the board
            const cardId = game.input("\nWhich card do you want to view? ");
            if (!cardId || !parseInt(cardId)) return false;

            const card = game.player.hand[parseInt(cardId) - 1];

            this.viewCard(card);
        }
        else if (name === "detail") {
            game.player.detailedView = !game.player.detailedView;
        }
        else if (name === "concede") {
            this.printAll(game.player);
            let confirmation = this.yesNoQuestion(game.player, "Are you sure you want to concede?");
            if (!confirmation) return false;

            game.endGame(game.player.getOpponent());
        }
        else if (name === "license") {
            let start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
            game.functions.runCommand(start + ' ' + license_url);
        }
        else if (name === "version") {
            let version = game.config.info.version;
            let branch = game.config.info.branch;
            let build = game.config.info.build;

            while (true) {
                let todos = Object.entries(game.config.todo);

                const print_info = () => {
                    this.printAll(game.player);

                    let strbuilder = `\nYou are on version: ${version}, on `;
    
                    if (branch == "topic") strbuilder += "a topic branch";
                    else if (branch == "alpha") strbuilder += "the alpha branch";
                    else if (branch == "beta") strbuilder += "the beta branch";
                    else if (branch == "stable") strbuilder += "the stable (release) branch";

                    strbuilder += `, on build ${build}`;
                    strbuilder += `, with latest commit hash '${game.functions.getLatestCommit()}',`
    
                    if (game.config.general.debug === true && game.config.ai.player2 === true) strbuilder += " using the debug settings preset";
                    else if (game.config.general.debug === false && game.config.ai.player2 === false) strbuilder += " using the recommended settings preset";
                    else strbuilder += " using custom settings";
    
                    game.log(strbuilder + ".\n");
    
                    game.log(`Version Description:`);

                    let introText;

                    if (branch == "topic") introText = game.config.info.topicIntroText;
                    else if (branch == "alpha") introText = game.config.info.alphaIntroText;
                    else if (branch == "beta") introText = game.config.info.betaIntroText;
                    else if (branch == "stable") introText = game.config.info.stableIntroText;

                    game.log(introText);
                    if (game.config.info.versionText) game.log(game.config.info.versionText);
                    game.log();

                    game.log("Todo List:");
                    if (todos.length <= 0) game.log("None.");
                }
                
                print_info();

                // Todo list
                if (todos.length <= 0) {
                    game.input("\nPress enter to continue...");
                    break;
                }

                const print_todo = (todo: any, id: number, print_desc = false) => {
                    let [name, info] = todo;
                    let [state, desc] = info;

                    if (state == "done") state = "x";
                    else if (state == "doing") state = "o";
                    else if (state == "not done") state = " ";

                    if (print_desc) game.log(`{${id}} [${state}] ${name}\n${desc}`);
                    else game.log(`{${id}} [${state}] ${name}`);
                }

                todos.forEach((e, i) => print_todo(e, i + 1));

                let todo_id = parseInt(game.input("\nType the id of a todo to see more information about it (eg. 1): "));
                if (!todo_id || todo_id > todos.length || todo_id <= 0) {
                    break;
                }

                let todo = todos[todo_id - 1];

                print_info();
                print_todo(todo, todo_id, true);
                
                game.input("\nPress enter to continue...");
            }
        }
        else if (name === "history") {
            if (echo === false) {}
            else game.log("<yellow>Cards that are shown are collected while this screen is rendering. This means that it gets the information about the card from where it is when you ran this command, for example; the graveyard. This is why most cards have <1 health.</yellow>");

            // History
            let history = game.events.history;
            let finished = "";

            const showCard = (val: Card) => {
                return `${this.getReadableCard(val)} which belongs to: <blue>${val.plr.name}</blue>, and has uuid: ${val.uuid.slice(0, 8)}`;
            }

            /**
             * Transform the `value` into a readable string
             * 
             * @param hide If it should hide the card
             */
            const doVal = (val: any, plr: Player, hide: boolean): any => {
                if (val instanceof Card) {
                    // If the card is not hidden, or the card belongs to the current player, show it
                    if (!hide || val.plr == plr) return showCard(val);

                    // Hide the card
                    let revealed = false;

                    // It has has been revealed, show it.
                    Object.values(history).forEach(h => {
                        if (revealed) return;

                        h.forEach(c => {
                            if (revealed) return;

                            let [key, newVal, _] = c;

                            // This shouldn't happen?
                            if (!newVal) return;

                            if (game.config.advanced.whitelistedHistoryKeys.includes(key)) {}
                            else return;

                            if (game.config.advanced.hideValueHistoryKeys.includes(key)) return;

                            // If it is not a card
                            if (!(newVal instanceof Card)) return;

                            if (val.uuid != newVal.uuid) return;

                            // The card has been revealed.
                            revealed = true;
                        });
                    });

                    if (revealed) return "Hidden > Revealed as: " + showCard(val);
                    else return "Hidden";
                }
                else if (val instanceof Player) return `Player ${val.id + 1}`;

                // Return val as-is if it is not a card / player
                return val;
            }

            Object.values(history).forEach((h, t) => {
                let hasPrintedHeader = false;
                let prevPlayer: Player;

                h.forEach((c, i: number) => {
                    let [key, val, plr] = c;

                    if (plr != prevPlayer) hasPrintedHeader = false;
                    prevPlayer = plr;

                    if (game.config.advanced.whitelistedHistoryKeys.includes(key) || debug) {}
                    else return;

                    // If the `key` is "AddCardToHand", check if the previous history entry was `DrawCard`, and they both contained the exact same `val`.
                    // If so, ignore it.
                    if (key === "AddCardToHand" && i > 0) {
                        let last_entry = history[t][i - 1];

                        if (last_entry[0] == "DrawCard") {
                            if ((last_entry[1] as Card).uuid == (val as Card).uuid) return;
                        }
                    }

                    let shouldHide = game.config.advanced.hideValueHistoryKeys.includes(key) && !debug;

                    if (!hasPrintedHeader) finished += `\nTurn ${t} - Player [${plr.name}]\n`; 
                    hasPrintedHeader = true;

                    val = doVal(val, game.player, shouldHide);

                    if (val instanceof Array) {
                        let strbuilder = "";

                        val.forEach(v => {
                            v = doVal(v, game.player, shouldHide);
                            strbuilder += `${v}, `;
                        });

                        strbuilder = strbuilder.slice(0, -2);
                        val = strbuilder;
                    }

                    let finishedKey = key[0].toUpperCase() + key.slice(1);

                    finished += `${finishedKey}: ${val}\n`;
                });
            });


            if (echo === false) {}
            else {
                game.log(finished);

                game.input("\nPress enter to continue...");
            }

            return finished;
        }

        else if (name.startsWith("/") && !game.config.general.debug) {
            game.input("<red>You are not allowed to use this command.</red>");
            return false;
        }

        else if (name === "/give") {    
            if (args.length <= 0) {
                game.input("<red>Too few arguments.</red>\n");
                return false;
            }

            let cardName = args.join(" ");

            let card = game.functions.getCardByName(cardName);
            if (!card) {
                game.input(`<red>Invalid card: <yellow>${cardName}</yellow>.\n`);
                return false;
            }
    
            game.player.addToHand(new Card(card.name, game.player));
        }
        else if (name === "/eval") {
            if (args.length <= 0) {
                game.input("<red>Too few arguments.</red>\n");
                return -1;
            }

            let log = false;

            if (args[0] == "log") {
                log = true;
                args.shift();
            }

            let code = args.join(" ");

            if (log) {
                if (game.functions.lastChar(code) == ";") code = code.slice(0, -1);

                code = `game.log(${code});game.input();`;
            }
    
            game.evaling = true;
            try {
                eval(code);

                game.events.broadcast("Eval", code, game.player);
            } catch (err) {
                game.log("\n<red>An error happened while running this code! Here is the error:</red>");
                game.log(err.stack);
                game.input("Press enter to continue...");
            }
            game.evaling = false;
        }
        else if (name === "/debug") {    
            game.player.maxMana = 1000;
            game.player.emptyMana = 1000;
            game.player.mana = 1000;
    
            game.player.health += 10000;
            game.player.armor += 100000;
            game.player.fatigue = 0;
        }
        else if (name === "/undo") {
            // Get the last played card
            if (!game.events.events.PlayCard || game.events.events.PlayCard[game.player.id].length <= 0) {
                game.input("<red>No cards to undo.</red>\n");
                return false;
            }

            let eventCards: [Card, number][] = game.events.events.PlayCard[game.player.id];
            if (eventCards.length <= 0) {
                game.input("<red>No cards to undo.</red>\n");
                return false;
            }

            let card = game.functions.last(eventCards)?.[0];
            if (!card) {
                game.input("<red>No cards found.</red>\n");
                return false;
            }

            // Remove the event so you can undo more than the last played card
            game.events.events.PlayCard[game.player.id].pop();

            // If the card can appear on the board, remove it.
            if (game.functions.canBeOnBoard(card)) {
                game.functions.remove(game.board[game.player.id], card);

                // If the card has 0 or less health, restore it to its original health (according to the blueprint)
                if (card.type === "Minion" && card.getHealth() <= 0) {
                    if (!card.stats) throw new Error("Minion has no stats!");
                    if (!card.blueprint.stats) throw new Error("Minion has no blueprint stats!");

                    card.stats[1] = card.blueprint.stats[1];
                }
                else if (card.type === "Location" && (card.durability ?? 0 <= 0)) {
                    if (!card.durability) throw new Error("Location has undefined durability!");
                    card.durability = card.blueprint.durability;
                }
            }

            card = card.perfectCopy();

            // If the card is a weapon, destroy it before adding it to the player's hand.
            if (card.type === "Weapon") {
                game.player.destroyWeapon();
            }

            // If the card is a hero, reset the player's hero to the default one from their class.
            if (card.type === "Hero") {
                game.player.setToStartingHero();
            }

            game.player.addToHand(card);
            game.player.refreshMana(card.cost);
        }
        else if (name === "/exit") {
            game.running = false;
            game.functions.createLogFile();
        }
        else if (name === "/ai") {
            let finished = "";

            if (echo) finished += "AI Info:\n\n";

            for (let i = 0; i < 2; i++) {
                let plr = game.functions.getPlayerFromId(i);
                if (!plr.ai) continue;

                finished += `AI${i + 1} History: {\n`;

                plr.ai.history.forEach((obj: AIHistory, objIndex: number) => {
                    finished += `${objIndex + 1} ${obj.type}: (${obj.data}),\n`;
                });
                
                finished += "}\n";
            }

            if (echo === false) {}
            else {
                game.log(finished);

                game.input("\nPress enter to continue...");
            }

            return finished;
        }
        else if (name === "/cmd") {
            let history = Object.values(game.events.history).map(t => t.filter(
                (v) => v[0] == "Input" &&
                (v[1] as EventValue<"Input">).startsWith("/") &&
                v[2] == game.player &&
                !(v[1] as EventValue<"Input">).startsWith("/cmd")
            ));
            
            history.forEach((obj, i) => {
                if (obj.length <= 0) return;

                game.log(`\nTurn ${i}:`);

                let index = 1;
                obj.forEach(h => {
                    /**
                     * The user's input
                     */
                    let input = h[1];

                    game.log(`[${index++}] ${input}`);
                });
            });

            let turnIndex = parseInt(game.input("\nWhich turn does the command belong to? (eg. 1): "));
            if (!turnIndex || turnIndex < 0 || !history[turnIndex]) {
                game.input("<red>Invalid turn.</red>\n");
                return false;
            }

            let commandIndex = parseInt(game.input("\nWhat is the index of the command in that turn? (eg. 1): "));
            if (!commandIndex || commandIndex < 1 || !history[turnIndex][commandIndex - 1]) {
                game.input("<red>Invalid command index.</red>\n");
                return false;
            }

            let command = history[turnIndex][commandIndex - 1][1];
            if (!command) {
                game.input("<red>Invalid command.</red>\n");
                return false;
            }

            command = command as EventValue<"Input">;

            this.printAll(game.player);
            let options = parseInt(game.input(`\nWhat would you like to do with this command?\n${command}\n\n(1. Run it, 2. Edit it, 0. Cancel): `));
            if (!options) {
                game.input("<red>Invalid option.</red>\n");
                return false;
            }

            if (options === 0) return false;
            if (options === 1) {
                this.doTurnLogic(command);
            }
            if (options === 2) {
                let addition = game.input("Which card do you want to play? " + command);
                this.doTurnLogic(command + addition);
            }
        }
        else if (name === "/set") {
            if (args.length != 2) {
                game.input("<red>Invalid amount of arguments!</red>\n");
                return false;
            }

            let [key, value] = args;

            let name = Object.keys(game.config).find(k => k === value);
            if (!name) {
                game.input("<red>Invalid setting name!</red>\n");
                return false;
            }

            let setting: {[key: string]: any} = game.config[name as keyof GameConfig];

            if (setting === undefined) {
                game.input("<red>Invalid setting name!</red>\n");
                return false;
            }

            if (!(/number|boolean|string/.test(typeof setting))) {
                game.input(`<red>You cannot change this setting, as it is a '${typeof setting}', and you can only change: number, boolean, string.</red>\n`);
                return false;
            }

            if (key === "debug") {
                game.input("<red>You can't change the debug setting, as that could lock you out of the set command.</red>\n");
                return false;
            }

            let newValue;

            if (["off", "disable", "false", "no", "0"].includes(value)) {
                game.log(`<bright:green>Setting '${key}' has been disabled.</bright:green>`);
                newValue = false;
            }
            else if (["on", "enable", "true", "yes", "1"].includes(value)) {
                game.log(`<bright:green>Setting '${key}' has been disabled.</bright:green>`);
                newValue = true;
            }
            else if (parseFloat(value)) {
                game.log(`<bright:green>Setting '${key}' has been set to the float: ${value}.</bright:green>`);
                newValue = parseFloat(value);
            }
            else if (parseInt(value)) {
                game.log(`<bright:green>Setting '${key}' has been set to the integer: ${value}.</bright:green>`);
                newValue = parseInt(value);
            }
            else {
                game.log(`<bright:green>Setting '${key}' has been set to the string literal: ${value}.</bright:green>`);
                newValue = value;
            }

            if (newValue === undefined) {
                // This should never really happen
                game.input("<red>Invalid value!</red>\n");
                return false;
            }

            game.config[key as keyof GameConfig] = newValue as any;
            game.doConfigAI();
            
            game.input();
        }
        else if (name === "/reload" || name === "/rl") {
            if (game.config.advanced.reloadCommandConfirmation && !debug) {
                this.printAll(game.player);
                let sure = this.yesNoQuestion(game.player, "<yellow>Are you sure you want to reload? This will reset all cards to their base state. This can also cause memory leaks with excessive usage.\nThis requires the game to be recompiled. I recommend using `tsc --watch` in another window before running this command.</yellow>");
                if (!sure) return false;
            }

            let success = true;

            success = success && this.withStatus("Registering cards", () => {
                reloadCards(game.functions.dirname() + "/dist/cards");
                return true;
            });

            // Go through all the cards and reload them
            success = success && this.withStatus("Reloading cards", () => {
                /**
                 * Reloads a card
                 */
                const reload = (card: Card) => {
                    card.doBlueprint();
                }

                [game.player1, game.player2].forEach(p => {
                    p.hand.forEach(c => reload(c));
                    p.deck.forEach(c => reload(c));
                });

                game.board.forEach(p => {
                    p.forEach(c => reload(c));
                });

                game.graveyard.forEach(p => {
                    p.forEach(c => reload(c));
                });

                return true;
            });

            if (!debug && success) game.input("\nThe cards have been reloaded.\nPress enter to continue...");
            if (!success) game.input("\nSome steps failed. The game could not be fully reloaded. Please report this.\nPress enter to continue...");
        }
        else if (name === "/freload" || name === "/frl") {
            return this.handleCmds("/reload", true, true);
        }
        else if (name === "/history") {
            return this.handleCmds("history", true, true);
        }
        // -1 if the command is not found
        else return -1;

        // true if a command was ran, and no errors were found
        return true;
    },

    /**
     * Takes the input and checks if it is a command, if it is not, play the card with the id of input parsed into a number
     * 
     * @param input The user input
     * 
     * @returns true | The return value of `game.playCard`
     */
    doTurnLogic(input: string): GamePlayCardReturn {
        game = globalThis.game;

        if (this.handleCmds(input) !== -1) return true;
        let parsedInput = parseInt(input);

        let card = game.player.hand[parsedInput - 1];
        if (!card) return "invalid";

        if (parsedInput == game.player.hand.length || parsedInput == 1) card.activate("outcast");
        return game.playCard(card, game.player);
    },

    /**
     * Show the game state and asks the user for an input which is put into `doTurnLogic`.
     * 
     * This is the core of the game loop.
     * 
     * @returns Success | The return value of doTurnLogic
     */
    doTurn(): boolean | string | GamePlayCardReturn {
        game = globalThis.game;
        game.events.tick("GameLoop", "doTurn");

        if (game.player.ai) {
            let input;

            const rawInput = game.player.ai.calcMove();
            if (!rawInput) return false;
            if (rawInput instanceof Card) input = (game.player.hand.indexOf(rawInput) + 1).toString();
            else input = rawInput;

            let turn = this.doTurnLogic(input);

            game.killMinions();

            return turn;
        }

        this.printAll(game.player);
    
        let input = "\nWhich card do you want to play? ";
        if (game.turns <= 2 && !game.config.general.debug) input += "(type 'help' for further information <- This will disappear once you end your turn) ";
    
        let user = game.input(input);
        const ret = this.doTurnLogic(user);
        game.killMinions();

        // If there were no errors, return true.
        if (ret === true || ret instanceof Card) return ret;

        // Ignore these error codes
        if (["refund", "magnetize", "traded", "colossal"].includes(ret)) return ret;
        let err;

        // Get the card
        let card = game.player.hand[parseInt(user) - 1];
        let cost = "mana";
        if (card) cost = card.costType;

        // Error Codes
        if (ret == "cost") err = `Not enough ${cost}`;
        else if (ret == "counter") err = "Your card has been countered";
        else if (ret == "space") err = `You can only have ${game.config.general.maxBoardSpace} minions on the board`;
        else if (ret == "invalid") err = "Invalid card";
        else err = `An unknown error occurred. Error code: UnexpectedDoTurnResult@${ret}`;

        game.log(`<red>${err}.</red>`);
        game.input();

        return false;
    },

    /**
     * Asks the user to select a location card to use, and activate it.
     * 
     * @return Success
     */
    useLocation(): boolean | "nolocations" | "invalidtype" | "cooldown" | -1 {
        game = globalThis.game;

        let locations = game.board[game.player.id].filter(m => m.type == "Location");
        if (locations.length <= 0) return "nolocations";

        let location = this.selectCardTarget("Which location do you want to use?", null, "friendly", ["allow_locations"]);
        if (!location) return -1;

        if (location.type != "Location") return "invalidtype";
        if (location.cooldown && location.cooldown > 0) return "cooldown";
        
        if (location.activate("use") === game.constants.REFUND) return -1;
        
        // TODO: Maybe throw an error if the durability is undefined
        if (location.durability) location.durability -= 1;
        location.cooldown = location.backups.init.cooldown;
        return true;
    },

    // Deck stuff

    /**
     * Asks the player to supply a deck code, if no code was given, fill the players deck with 30 Sheep.
     * 
     * This does not fill the players deck with 30 Sheep if:
     * - Debug mode is disabled
     * - The program is running on the stable branch
     * 
     * @param plr The player to ask
     * 
     * @returns Success
     */
    deckCode(plr: Player): boolean {
        game = globalThis.game;
        this.printName();
    
        /**
         * If the test deck (30 Sheep) should be allowed
         */
        // I want to be able to test without debug mode on a non-stable branch
        let allowTestDeck: boolean = game.config.general.debug || game.config.info.branch !== "stable";

        let debugStatement = allowTestDeck ? " <gray>(Leave this empty for a test deck)</gray>" : "";
        const deckcode = game.input(`Player ${plr.id + 1}, please type in your deckcode${debugStatement}: `);

        let result: boolean | Card[] | null = true;

        if (deckcode.length > 0) result = game.functions.deckcode.import(plr, deckcode);
        else {
            if (!allowTestDeck) {
                // Give error message
                game.input("<red>Please enter a deckcode!</red>\n");
                return false;
            }

            // Debug mode is enabled, use the 30 Sheep debug deck.
            while (plr.deck.length < 30) plr.deck.push(new Card("Sheep", plr));
        }

        if (result === null) return false;

        return true;
    },

    /**
     * Asks the player to mulligan their cards
     * 
     * @param plr The player to ask
     * 
     * @returns A string of the indexes of the cards the player mulligan'd
     */
    mulligan(plr: Player): string {
        game = globalThis.game;

        this.printAll(plr);

        let sb = "\nChoose the cards to mulligan (1, 2, 3, ...):\n";
        if (!game.config.general.debug) sb += "<gray>(Example: 13 will mulligan the cards with the ids 1 and 3, 123 will mulligan the cards with the ids 1, 2 and 3, just pressing enter will not mulligan any cards):</gray>\n";

        let input;

        if (plr.ai) input = plr.ai.mulligan();
        else input = game.input(sb);

        let is_int = game.functions.mulligan(plr, input);

        if (!is_int && input != "") {
            game.input("<red>Invalid input!</red>\n");
            return this.mulligan(plr);
        }

        return input;
    },

    /**
     * Asks the current player a `prompt` and shows 3 cards from their deck for the player to choose, the chosen card will be added to the top of their deck
     * 
     * @param prompt The prompt to ask the user
     * 
     * @returns The card chosen
     */
    dredge(prompt: string = "Choose a card to Dredge:"): Card | null {
        game = globalThis.game;

        // Look at the bottom three cards of the deck and put one on the top.
        let cards = game.player.deck.slice(0, 3);

        // Check if ai
        if (game.player.ai) {
            let card = game.player.ai.dredge(cards);
            if (!card) return null;

            // Removes the selected card from the players deck.
            game.functions.remove(game.player.deck, card);
            game.player.deck.push(card);

            return card;
        }

        this.printAll(game.player);

        game.log(`\n${prompt}`);

        if (cards.length <= 0) return null;

        cards.forEach((c, i) => {
            game.log(this.getReadableCard(c, i + 1));
        });

        let choice = game.input("> ");

        const cardId = parseInt(choice) - 1;
        let card = cards[cardId];

        if (!card) {
            return this.dredge(prompt);
        }

        // Removes the selected card from the players deck.
        game.functions.remove(game.player.deck, card);
        game.player.deck.push(card);

        return card;
    },

    // One-time things

    /**
     * Asks the current player a `prompt` give the user `options` and do it all `times` times
     * 
     * @param prompt The prompt to ask the user
     * @param options The options to give the user
     * @param times The amount of times to ask
     * 
     * @returns The chosen answer(s) index(es)
     */
    chooseOne(prompt: string, options: string[], times: number = 1): number | null | (number | null)[] {
        game = globalThis.game;

        this.printAll(game.player);

        let choices = [];

        for (let _ = 0; _ < times; _++) {
            if (game.player.ai) {
                choices.push(game.player.ai.chooseOne(options));
                continue;
            }

            let p = `\n${prompt} [`;

            options.forEach((v, i) => {
                p += `${i + 1}: ${v}, `;
            });

            p = p.slice(0, -2);
            p += "] ";

            let choice = game.input(p);
            if (!parseInt(choice)) {
                game.input("<red>Invalid input!</red>\n");
                return this.chooseOne(prompt, options, times);
            }

            choices.push(parseInt(choice) - 1);
        }

        if (times === 1) {
            return choices[0];
        } else {
            return choices;
        }
    },

    /**
     * Asks the `plr` a `prompt`, show them a list of `answers` and make them choose one
     *
     * @param plr The player to ask
     * @param prompt The prompt to show
     * @param answers The answers to choose from
     *
     * @returns Chosen
     */
    question(plr: Player, prompt: string, answers: string[]): string {
        game = globalThis.game;

        const RETRY = () => {
            return this.question(plr, prompt, answers);
        }

        this.printAll(plr);

        let strbuilder = `\n${prompt} [`;

        answers.forEach((v, i) => {
            strbuilder += `${i + 1}: ${v}, `;
        });

        strbuilder = strbuilder.slice(0, -2);
        strbuilder += "] ";

        let choice: number;

        if (plr.ai) {
            let aiChoice = plr.ai.question(prompt, answers);
            if (!aiChoice) {
                // code, expected, actual
                throw game.functions.createAIError("ai_question_return_invalid_at_question_function", "some number", aiChoice);
            }

            choice = aiChoice;
        }
        else choice = parseInt(game.input(strbuilder));

        let answer = answers[choice - 1];
        if (!answer) {
            game.input("<red>Invalid input!</red>\n");
            RETRY();
        }

        return answer;
    },

    /**
     * Asks the user a yes/no question
     *
     * @param plr The player to ask
     * @param prompt The prompt to ask
     *
     * @returns `true` if Yes / `false` if No
     */
    yesNoQuestion(plr: Player, prompt: string): boolean {
        game = globalThis.game;

        let ask = `\n${prompt} [<bright:green>Y</bright:green> | <red>N</red>] `;

        if (plr.ai) return plr.ai.yesNoQuestion(prompt);

        let _choice = game.input(ask);
        let choice = _choice.toUpperCase()[0];

        if (["Y", "N"].includes(choice)) return choice === "Y";

        // Invalid input
        game.log(`<red>Unexpected input: '<yellow>${_choice}</yellow>'. Valid inputs: </red>[<bright:green>Y</bright:green> | <red>N</red>]`);
        game.input();

        return this.yesNoQuestion(plr, prompt);
    },

    /**
     * Asks the user a "prompt", show them "amount" cards. The cards are chosen from "cards".
     * 
     * @param prompt The prompt to ask
     * @param cards The cards to choose from
     * @param filterClassCards If it should filter away cards that do not belong to the player's class. Keep this at default if you are using `functions.getCards()`, disable this if you are using either player's deck / hand / graveyard / etc...
     * @param amount The amount of cards to show
     * @param _cards Do not use this variable, keep it at default
     * 
     * @returns The card chosen.
     */
    discover(prompt: string, cards: CardLike[] = [], filterClassCards: boolean = true, amount: number = 3, _cards: CardLike[] = []): Card | null {
        game = globalThis.game;

        // TODO: Discover doesn't work
        this.printAll(game.player);
        let values: CardLike[] = _cards;

        if (cards.length <= 0) cards = game.functions.getCards();
        if (cards.length <= 0 || !cards) return null;

        if (filterClassCards) {
            // We need to filter the cards
            // of the filter function
            cards = cards.filter(card => game.functions.validateClass(game.player, card));
        }

        // No cards from previous discover loop, we need to generate new ones.
        if (_cards.length == 0) {
            values = game.functions.chooseItemsFromList(cards, amount)?.map(c => c.copy) ?? [];
        }

        if (values.length <= 0) return null;

        if (game.player.ai) return game.player.ai.discover(values);

        game.log(`\n${prompt}:`);

        values.forEach((v, i) => {
            let card = game.functions.getCardByName(v.name);
            if (!card) return;

            game.log(this.getReadableCard(v, i + 1));
        });

        let choice = game.input();

        if (!values[parseInt(choice) - 1]) {
            // Invalid input
            // We still want the user to be able to select a card, so we force it to be valid
            return this.discover(prompt, cards, filterClassCards, amount, values);
        }

        let card: Card;

        // Potential Blueprint card
        let pbcard = values[parseInt(choice) - 1];

        if (!(pbcard instanceof Card)) card = new Card(pbcard.name, game.player);
        else card = pbcard;

        return card;
    },

    /**
     * Like `selectTarget` but restricts the user to selecting heroes.
     * 
     * The advantage of this function is that it returns `Player | false` instead of `Target | false`.
     */
    selectPlayerTarget(prompt: string, card: Card | null, flags: SelectTargetFlag[] = []): Player | false {
        return this.selectTarget(prompt, card, "any", "hero", flags) as Player | false;
    },

    /**
     * Like `selectTarget` but restricts the user to selecting minions.
     * 
     * The advantage of this function is that it returns `Card | false` instead of `Target | false`.
     */
    selectCardTarget(prompt: string, card: Card | null, side: SelectTargetAlignment, flags: SelectTargetFlag[] = []): Card | false {
        return this.selectTarget(prompt, card, side, "minion", flags) as Card | false;
    },

    /**
     * #### You might want to use `selectPlayerTarget` or `selectCardTarget` instead.
     * 
     * Asks the user a `prompt`, the user can then select a minion or hero.
     * Broadcasts the `TargetSelectionStarts` and the `TargetSelected` event. Can broadcast the `CastSpellOnMinion` event.
     * 
     * @param prompt The prompt to ask
     * @param card The card that called this function.
     * @param force_side Force the user to only be able to select minions / the hero of a specific side
     * @param force_class Force the user to only be able to select a minion or a hero
     * @param flags Change small behaviours ["allow_locations" => Allow selecting location, ]
     * 
     * @returns The card or hero chosen
     */
    selectTarget(prompt: string, card: Card | null, force_side: SelectTargetAlignment, force_class: SelectTargetClass, flags: SelectTargetFlag[] = []): Target | false {
        game = globalThis.game;

        game.events.broadcast("TargetSelectionStarts", [prompt, card, force_side, force_class, flags], game.player);
        let target = this._selectTarget(prompt, card, force_side, force_class, flags);

        if (target) game.events.broadcast("TargetSelected", [card, target], game.player);
        return target;
    },

    _selectTarget(prompt: string, card: Card | null, force_side: SelectTargetAlignment, force_class: SelectTargetClass, flags: SelectTargetFlag[] = []): Target | false {
        // If the player is forced to select a target, select that target.
        if (game.player.forceTarget) return game.player.forceTarget;

        // If the player is an ai, hand over control to the ai.
        if (game.player.ai) return game.player.ai.selectTarget(prompt, card, force_side, force_class, flags);

        // If the player is forced to select a hero
        if (force_class == "hero") {
            const target = game.input(`Do you want to select the enemy hero, or your own hero? (y: enemy, n: friendly) `);
    
            return (target.startsWith("y")) ? game.opponent : game.player;
        }

        // From this point, force_class is either
        // 1. any 
        // 2. minion

        // Ask the player to choose a target.
        let p = `\n${prompt} (`;
        if (force_class === "any") p += "type 'face' to select a hero | ";
        p += "type 'back' to go back) ";

        const target = game.input(p);

        // Player chose to go back
        if (target.startsWith("b") || this.shouldExit(target)) {
            // This should always be safe.
            return false;
        }

        // Get a list of each side of the board
        const board_opponent = game.board[game.opponent.id];
        const board_friendly = game.board[game.player.id];

        // Get each minion that matches the target.
        const board_opponent_target = board_opponent[parseInt(target) - 1];
        const board_friendly_target = board_friendly[parseInt(target) - 1];

        /**
         * This is the resulting minion that the player chose, if any.
         */
        let minion: Card;

        // If the player didn't choose to attack a hero, and no minions could be found at the index requested, try again.
        if (!target.startsWith("face") && !board_friendly_target && !board_opponent_target) {
            // target != "face" and target is not a minion.
            // The input is invalid
            game.input("<red>Invalid input / minion!</red>\n");

            return this._selectTarget(prompt, card, force_side, force_class, flags);
        }

        // If the player is forced to one side.
        if (force_side === "any") {
            // If the player chose to target a hero, it will ask which hero.
            if (target.startsWith("face") && force_class != "minion") return this._selectTarget(prompt, card, force_side, "hero", flags);
            
            // If both players have a minion with the same index,
            // ask them which minion to select
            if (board_opponent.length >= parseInt(target) && board_friendly.length >= parseInt(target)) {
                const oName = game.functions.colorByRarity(board_opponent_target.displayName, board_opponent_target.rarity);
                const fName = game.functions.colorByRarity(board_friendly_target.displayName, board_friendly_target.rarity);

                let alignment = game.input(`Do you want to select your opponent's (${oName}) or your own (${fName})? (y: opponent, n: friendly | type 'back' to go back) `);
            
                if (alignment.startsWith("b") || this.shouldExit(alignment)) {
                    // Go back.
                    return this._selectTarget(prompt, card, force_side, force_class, flags);
                }

                minion = (alignment.startsWith("y")) ? board_opponent_target : board_friendly_target;
            } else {
                minion = board_opponent.length >= parseInt(target) ? board_opponent_target : board_friendly_target;
            }
        }
        else {
            // If the player chose a hero, and they are allowed to
            if (target.startsWith("face") && force_class != "minion") {
                if (force_side == "enemy") return game.opponent;

                return game.player;
            }

            // Select the minion on the correct side of the board.
            minion = (force_side == "enemy") ? board_opponent_target : board_friendly_target;
        }

        // If you didn't select a valid minion, return.
        if (minion === undefined) {
            game.input("<red>Invalid minion.</red>\n");
            return false;
        }

        // If the minion has elusive, and the card that called this function is a spell
        if ((card && card.type === "Spell") || flags.includes("force_elusive")) {
            if (minion.keywords.includes("Elusive")) {
                game.input("<red>Can't be targeted by Spells or Hero Powers.</red>\n");
            
                return false;
            }

            game.events.broadcast("CastSpellOnMinion", [card, minion], game.player);
        }

        // If the minion has stealth, don't allow the opponent to target it.
        if (minion.keywords.includes("Stealth") && game.player != minion.plr) {
            game.input("<red>This minion has stealth.</red>\n");

            return false;
        }

        // If the minion is a location, don't allow it to be selectted unless the `allow_locations` flag was set.
        if (minion.type == "Location" && !flags.includes("allow_locations")) {
            game.input("<red>You cannot target location cards.</red>\n");

            return false;
        }

        return minion;
    },

    // Print game information

    /**
     * Prints the "watermark" border
     */
    printName(): void {
        cls();
        game = globalThis.game;

        let info = game.config.info;
        let versionDetail = game.player.detailedView ? 4 : 3;
    
        let watermarkString = `HEARTHSTONE.JS V${game.functions.getVersion(versionDetail)}`;
        let border = "-".repeat(watermarkString.length + 2);
    
        game.log(`|${border}|`);
        game.log(`| ${watermarkString} |`);
        game.log(`|${border}|\n`);

        if (info.branch == "topic" && game.config.general.topicBranchWarning) {
            game.log("<yellow>WARNING: YOU ARE ON A TOPIC BRANCH. THIS VERSION IS NOT READY.</yellow>\n");
        }
    },

    /**
     * Prints some license info
     * 
     * @param disappear If this is true, "This will disappear once you end your turn" will show up.
     */
    printLicense(disappear: boolean = true): void {
        game = globalThis.game;
        if (game.config.general.debug) return;
        let info = game.config.info;
    
        cls();
    
        let version = `Hearthstone.js V${game.functions.getVersion(2)} | Copyright (C) 2022 | LunarTides`;
        game.log('|'.repeat(version.length + 8));
        game.log(`||| ${version} |||`)
        game.log(`|||     This program is licensed under the GPL-3.0 license.  ` + ' '.repeat(info.branch.length) + "|||")
        if (disappear)
        game.log(`|||         This will disappear once you end your turn.      ` + ' '.repeat(info.branch.length) + `|||`)
        game.log('|'.repeat(version.length + 8));
    },

    /**
     * Shows `status`..., calls `callback`, then adds 'OK' or 'FAIL' to the end of that line depending on the result the callback
     * 
     * @param status The status to show.
     * @param callback The callback to call.
     * 
     * @returns The return value of the callback. If the callback didn't explicitly return false then it was successful.
     */
    withStatus(status: string, callback: () => boolean): boolean {
        game = globalThis.game;

        process.stdout.write(`${status}...`);
        let success = callback() !== false;
        
        let msg = (success) ? "OK" : "FAIL";
        process.stdout.write(`\r\x1b[K${status}...${msg}\n`);

        return success;
    },

    /**
     * Replaces placeholders in the description of a card object.
     *
     * @param card The card.
     * @param overrideDesc The description. If empty, it uses the card's description instead.
     * @param _depth The depth of recursion.
     * 
     * @return The modified description with placeholders replaced.
     */
    doPlaceholders(card: Card, overrideDesc: string = "", _depth: number = 0): string {
        game = globalThis.game;
        let reg = new RegExp(`{ph:(.*?)} .*? {/ph}`);

        let desc = overrideDesc;
        if (!overrideDesc) desc = card.desc || "";

        while (true) {
            let regedDesc = reg.exec(desc);
            
            // There is nothing more to extract
            if (!regedDesc) break;

            // Get the capturing group result
            let key = regedDesc[1];

            card.replacePlaceholders();
            let _replacement = card.placeholder;
            if (!_replacement) throw new Error("Card placeholder not found.");

            let replacement = _replacement[key];

            if (replacement instanceof Card) {
                // The replacement is a card
                let onlyShowName = (
                    game.config.advanced.getReadableCardNoRecursion ||
                    !game.player.detailedView
                );
                
                if (onlyShowName && !game.config.advanced.getReadableCardAlwaysShowFullCard) {
                    // Only show the name of the card
                    replacement = game.functions.colorByRarity(replacement.displayName, replacement.rarity);
                }
                else {
                    // Show the full card using recursion
                    replacement = this.getReadableCard(replacement, -1, _depth + 1);
                }
            }

            desc = game.functions.parseTags(desc.replace(reg, replacement));
        }

        // Replace spell damage placeholders
        reg = /\$(\d+?)/;

        while (true) {
            let regedDesc = reg.exec(desc);
            if (!regedDesc) break;

            // Get the capturing group result
            let key = regedDesc[1];
            let replacement = parseInt(key) + game.player.spellDamage;

            desc = desc.replace(reg, replacement.toString());
        }

        return desc;
    },

    /**
     * Returns if the input is a command to exit / go back.
     */
    shouldExit(input: string): boolean {
        return ["exit", "stop", "quit", "back", "close"].includes(input.toLowerCase());
    },

    /**
     * Returns the display name of a card.
     * 
     * If the card doesn't have a display name, it returns the name.
     */
    getDisplayName(card: CardLike) {
        return card.displayName ?? card.name;
    },

    /**
     * Returns a card in a user readable state. If you game.log the result of this, the user will get all the information they need from the card.
     *
     * @param card The card
     * @param i If this is set, this function will add `[i]` to the beginning of the card. This is useful if there are many different cards to choose from.
     * @param _depth The depth of recursion. DO NOT SET THIS MANUALLY.
     * 
     * @returns The readable card
     */
    getReadableCard(card: CardLike, i: number = -1, _depth: number = 0): string {
        game = globalThis.game;

        /**
         * If it should show detailed errors regarding depth.
         */
        let showDetailedError: boolean = (game.config.general.debug || game.config.info.branch !== "stable" || game.player.detailedView);

        if (_depth > 0 && game.config.advanced.getReadableCardNoRecursion) {
            if (showDetailedError) return "RECURSION ATTEMPT BLOCKED";
            else return "...";
        }

        if (_depth > game.config.advanced.getReadableCardMaxDepth) {
            if (showDetailedError) return "MAX DEPTH REACHED";
            else return "...";
        }

        let sb = "";

        let desc;

        if (card instanceof Card) desc = (card.desc || "").length > 0 ? ` (${card.desc}) ` : " ";
        else desc = card.desc.length > 0 ? ` (${game.functions.parseTags(card.desc)}) ` : " ";

        // Extract placeholder value, remove the placeholder header and footer
        if (card instanceof Card && (card.placeholder || /\$(\d+?)/.test(card.desc || ""))) {
            desc = this.doPlaceholders(card, desc, _depth);
        }

        let cost = `{${card.cost}} `;

        let costType = "mana";
        if (card instanceof Card && card.costType) costType = card.costType;

        switch (costType) {
            case "mana":
                cost = `<cyan>${cost}</cyan>`;
                break;
            case "armor":
                cost = `<gray>${cost}</gray>`;
                break;
            case "health":
                cost = `<red>${cost}</red>`;
                break;
            default:
                break;
        }

        let displayName = this.getDisplayName(card);

        if (i !== -1) sb += `[${i}] `;
        sb += cost;
        sb += game.functions.colorByRarity(displayName, card.rarity);
        
        if (card.stats) {
            sb += `<bright:green> [${card.stats?.join(" / ")}]</bright:green>`;
        }

        else if (card.type == "Location") {
            let durability = card.durability;
            let maxDurability = durability;
            let maxCooldown = card.cooldown;
            
            if (card instanceof Card) {
                maxDurability = card.backups.init.durability;
                maxCooldown = card.backups.init.cooldown ?? 0;
            }

            sb += " {";
            sb += `<bright:green>Durability: ${durability} / `;
            sb += maxDurability;
            sb += "</bright:green>, ";

            sb += `<cyan>Cooldown: ${card.cooldown} / ${maxCooldown}</cyan>`;
            sb += "}";
        }

        sb += desc;
        sb += `<yellow>(${card.type})</yellow>`;

        if (!(card instanceof Card)) return sb;

        const excludedKeywords = ["Magnetic", "Corrupt"];
        let keywords = card.keywords.filter(k => !excludedKeywords.includes(k));
        let keywordsString = keywords.length > 0 ? ` <gray>{${keywords.join(", ")}}</gray>` : "";
        sb += keywordsString;

        ["Frozen", "Dormant", "Immune"].forEach(k => {
            if (!card[k.toLowerCase() as keyof Card]) return;

            sb += ` <gray>(${k})</gray>`;
        });

        let sleepy = (card.sleepy) || (card.attackTimes && card.attackTimes <= 0) ? " <gray>(Sleepy)</gray>" : "";
        sb += sleepy;

        return sb;
    },

    /**
     * Prints all the information you need to understand the game state
     * 
     * @param plr The player
     */
    printAll(plr: Player): void {
        game = globalThis.game;

        this.printName();
        if (game.turns <= 2) this.printLicense();

        this.printPlayerStats(plr);
        game.log();
        this.printBoard(plr);
        game.log();
        this.printHand(plr);
    },

    printPlayerStats(plr: Player): void {
        const opponent = plr.getOpponent();

        let finished = "";
        let finishedPlayers: string[] = [];
        let totalTweak = 0;

        const doStatPT1 = (player: Player, callback: (player: Player) => [string, number]): [string[], number] => {
            let [stat, tweak] = callback(player);
            stat = game.functions.parseTags(stat);

            if (!stat) return [[""], 0];

            if (!finishedPlayers[player.id]) finishedPlayers[player.id] = "";
            finishedPlayers[player.id] += `${stat}\n`;

            let split = finishedPlayers[player.id].split("\n");
            game.functions.remove(split, "");

            return [game.functions.createWall(split, ":"), tweak];
        }

        const doStat = (callback: (player: Player) => [string, number]) => {
            let [playerWall, playerTweak] = doStatPT1(plr, callback);
            let [opponentWall, opponentTweak] = doStatPT1(opponent, callback);

            if (playerWall[0] === "") return;

            finished = "";
            playerWall.forEach((line, index) => {
                finished += `${line} | ${opponentWall[index]}\n`;
            });

            let finishedSplit = finished.split("\n");
            game.functions.remove(finishedSplit, "");

            let finishedWall = game.functions.createWall(finishedSplit, "|");
            finishedWall.forEach((line, index) => {
                let p = line.split("|")[0];
                let o = line.split("|")[1];

                // Remove `playerTweak` amount of spaces from the left side of `|`, and remove `opponentTweak` amount of spaces from the right side of `|`
                p = p.replace(new RegExp(` {${playerTweak + totalTweak}}`), "");
                o = o.replace(new RegExp(` {${opponentTweak + totalTweak}}`), "");

                finishedWall[index] = `${p} | ${o}`;
            });

            totalTweak += playerTweak;

            finished = `${finishedWall.join("\n")}`;
        }

        // Mana
        doStat((player: Player) => {
            return [`Mana: <cyan>${player.mana}</cyan> / <cyan>${player.emptyMana}</cyan>`, 0];
        });

        // Health
        doStat((player: Player) => {
            return [`Health: <red>${player.health}</red> / <red>${player.maxHealth}</red>`, 0];
        });

        // Deck Size
        doStat((player: Player) => {
            return [`Deck Size: <yellow>${player.deck.length}</yellow>`, 10];
        });

        // TODO: Add weapon
        // TODO: Add quests, secrets, etc...

        // Attack
        doStat((player: Player) => {
            return [`Attack: <bright:green>${player.attack}</bright:green>`, 0];
        });

        // Corpses
        doStat((player: Player) => {
            if (!plr.detailedView || plr.heroClass !== "Death Knight") return ["", 0];
            return [`Corpses: <gray>${player.corpses}</gray>`, 0];
        });

        game.log(finished);
    },

    printBoard(plr: Player): void {
        game.board.forEach((side, plrId) => {
            let player = game.functions.getPlayerFromId(plrId);
            let sideMessage = plr === player ? "----- Board (You) ------" : "--- Board (Opponent) ---";
            game.log(sideMessage);

            if (side.length === 0) {
                game.log("<gray>Empty</gray>");
                return;
            };

            side.forEach((card, index) => {
                game.log(this.getReadableCard(card, index + 1));
            });
        });

        game.log("------------------------");
    },

    printHand(plr: Player): void {
        game.log(`--- ${plr.name} (${plr.heroClass})'s Hand ---`);
        // Add the help message
        game.log(game.functions.parseTags(`([id] <cyan>{Cost}</cyan> <b>Name</b> <bright:green>[attack / health]</bright:green> <yellow>(type)</yellow>)\n`));

        plr.hand.forEach((card, index) => {
            game.log(this.getReadableCard(card, index + 1));
        });
    },

    /**
     * Shows information from the card, game.log's it and waits for the user to press enter.
     *
     * @param card The card
     * @param help If it should show a help message which displays what the different fields mean.
     */
    viewCard(card: CardLike, help: boolean = true) {
        game = globalThis.game;

        let _card = this.getReadableCard(card);
        let _class = `<gray>${card.classes.join(" / ")}</gray>`;

        let tribe = "";
        let spellSchool = "";
        let locCooldown = "";

        let type = card.type;

        if (type == "Minion") tribe = ` (<gray>${card.tribe ?? "None"}</gray>)`;
        else if (type == "Spell") {
            if (card.spellSchool) spellSchool = ` (<cyan>${card.spellSchool}</cyan>)`;
            else spellSchool = " (None)";
        }
        else if (type == "Location") {
            if (card instanceof Card) locCooldown = ` (<cyan>${card.blueprint.cooldown ?? 0}</cyan>)`;
            else locCooldown = ` (<cyan>${card.cooldown?.toString()}</cyan>)`;
        }

        if (help) game.log("<cyan>{cost}</cyan> <b>Name</b> (<bright:green>[attack / health]</bright:green> if is has) (description) <yellow>(type)</yellow> ((tribe) or (spell class) or (cooldown)) <gray>[class]</gray>");
        game.log(_card + (tribe || spellSchool || locCooldown) + ` [${_class}]`);

        game.input("\nPress enter to continue...\n");
    },

    /**
     * Verifies that the diy card has been solved.
     * 
     * @param condition The condition where, if true, congratulates the user
     * @param fileName The file's name in the `DIY` folder. E.g. `1.ts`
     * 
     * @returns Success
     */
    verifyDIYSolution(condition: boolean, fileName: string = ""): boolean {
        // TODO: Maybe spawn in diy cards mid-game in normal games to encourage players to solve them.
        // Allow that to be toggled in the config.
        if (condition) game.log("Success! You did it, well done!");
        else game.log(`Hm. This card doesn't seem to do what it's supposed to do... Maybe you should try to fix it? The card is in: './cards/Examples/DIY/${fileName}'.`);
        
        game.input();
        return true;
    },

    /**
     * Clears the screen.
     */
    cls() {
        cls();
    }
}

function cls() {
    if (game && game.no_output) return;

    console.clear();
    process.stdout.write('\x1bc');
}
