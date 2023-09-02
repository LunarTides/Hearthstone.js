import chalk from 'chalk';
import { exec } from 'child_process';
import { Card, Player } from './internal.js';
import { AIHistory, CardLike, EventValue, GameConfig, GamePlayCardReturn, SelectTargetAlignment, SelectTargetClass, SelectTargetFlag, Target } from './types.js';
import { reloadCards } from './importcards.cjs';

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
        let attacker, target;

        if (game.player.ai) {
            let ai;

            let alt_model = `legacy_attack_${game.config.AIAttackModel}`;

            if (Object.keys(game.player.ai).includes(alt_model)) {
                // @ts-expect-error - We know this exists, because of the if, but strict mode doesn't like it
                ai = game.player.ai[alt_model]();
            }
            else ai = game.player.ai.attack();

            attacker = ai[0];
            target = ai[1];

            if (attacker === -1 || target === -1) return -1;
            if (attacker === null || target === null) return null;
        } else {
            attacker = interact.selectTarget("Which minion do you want to attack with?", null, "friendly", "any");
            if (!attacker) return false;

            target = interact.selectTarget("Which minion do you want to attack?", null, "enemy", "any");
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

        console.log(chalk.red(`${err}.`));
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
        let args = q.split(" ");
        let name = args[0];
        args.shift();

        if (name === "end") game.endTurn();
        else if (q === "hero power") {
            if (game.player.ai) {
                game.player.heroPower();
                return true;
            }

            if (game.player.mana < game.player.heroPowerCost) {
                game.input(chalk.red("You do not have enough mana.\n"));
                return false;
            }

            if (!game.player.canUseHeroPower) {
                game.input(chalk.red("You have already used your hero power this turn.\n"));
                return false;
            }

            if (game.player.hero === null) {
                game.input(chalk.red("You do not have a hero.\n"));
                return false;
            }

            let ask = interact.yesNoQuestion(game.player, chalk.yellow(game.player.hero?.hpDesc) + " Are you sure you want to use this hero power?");
            if (!ask) return false;

            interact.printAll();
            game.player.heroPower();
        }
        else if (name === "attack") {
            interact.doTurnAttack();
            game.killMinions();
        }
        else if (name === "use") {
            // Use location
            let errorcode = interact.useLocation();
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

            console.log(chalk.red(`${err}.`));
            game.input();
        }
        else if (name === "help") {
            interact.printName();
            console.log("(In order to run a command; input the name of the command and follow further instruction.)\n");
            console.log("Available commands:");
            console.log("(name)     - (description)\n");

            console.log("end        - Ends your turn");
            console.log("attack     - Attack");
            console.log("hero power - Use your hero power");
            console.log("history    - Displays a history of actions");
            console.log("concede    - Forfeits the game");
            console.log("view       - View a minion");
            console.log("use        - Use a location card");
            console.log("detail     - Get more details about opponent");
            console.log("help       - Displays this message");
            console.log("version    - Displays the version, branch, your settings preset, and some information about your current version.");
            console.log("license    - Opens a link to this project's license");

            const cond_color = (str: string) => {return (game.config.debug) ? str : chalk.gray(str)};

            console.log(cond_color("\n--- Debug Commands (") + ((game.config.debug) ? chalk.greenBright("ON") : chalk.red("OFF")) + cond_color(") ---"));
            console.log(cond_color("/give (name)        - Adds a card to your hand"));
            console.log(cond_color("/eval [log] (code)  - Runs the code specified. If the word 'log' is before the code, instead console.log the code and wait for user input to continue."));
            console.log(cond_color("/set (name) (value) - Changes a setting to (value). Look in the config files for a list of settings."));
            console.log(cond_color("/debug              - Gives you infinite mana, health and armor"));
            console.log(cond_color("/exit               - Force exits the game. There will be no winner, and it will take you straight back to the runner."));
            console.log(cond_color("/history            - Displays a history of actions. This doesn't hide any information, and is the same thing the log files uses."));
            console.log(cond_color("/reload | /rl       - Reloads the cards and config in the game (Use '/freload' or '/frl' to ignore the confirmation prompt (or disable the prompt in the advanced config))"));
            console.log(cond_color("/undo               - Undoes the last card played. It gives the card back to your hand, and removes it from where it was. (This does not undo the actions of the card)"));
            console.log(cond_color("/cmd                - Shows you a list of debug commands you have run, and allows you to rerun them."));
            console.log(cond_color("/ai                 - Gives you a list of the actions the ai(s) have taken in the order they took it"));
            console.log(cond_color("---------------------------" + ((game.config.debug) ? "" : "-")));
            
            game.input("\nPress enter to continue...\n");
        }
        else if (name === "view") {
            let isHandAnswer = interact.question(game.player, "Do you want to view a minion on the board, or in your hand?", ["Board", "Hand"]);
            let isHand = isHandAnswer == "Hand";

            if (!isHand) {
                // allow_locations Makes selecting location cards allowed. This is disabled by default to prevent, for example, spells from killing the card.
                let minion = interact.selectCardTarget("Which minion do you want to view?", null, "any", ["allow_locations"]);
                if (!minion) return false;
        
                interact.viewCard(minion);

                return true;
            }

            // View minion on the board
            const cardId = game.input("\nWhich card do you want to view? ");
            if (!cardId || !parseInt(cardId)) return false;

            const card = game.player.hand[parseInt(cardId) - 1];

            interact.viewCard(card);
        }
        else if (name === "detail") {
            game.player.detailedView = !game.player.detailedView;
        }
        else if (name === "concede") {
            let confirmation = interact.yesNoQuestion(game.player, "Are you sure you want to concede?");
            if (!confirmation) return false;

            game.endGame(game.player.getOpponent());
        }
        else if (name === "license") {
            let start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
            exec(start + ' ' + license_url);
        }
        else if (name === "version") {
            while (true) {
                let todos = Object.entries(game.config.todo);

                const print_info = () => {
                    interact.printAll(game.player);

                    let strbuilder = `\nYou are on version: ${game.config.version} on `;
    
                    if (game.config.branch == "topic") strbuilder += "a topic branch";
                    else if (game.config.branch == "dev") strbuilder += "the develop (beta) branch";
                    else if (game.config.branch == "stable") strbuilder += "the stable (release) branch";
    
                    if (game.config.debug === true && game.config.P2AI === true) strbuilder += " using the debug settings preset";
                    else if (game.config.debug === false && game.config.P2AI === false) strbuilder += " using the recommended settings preset";
                    else strbuilder += " using custom settings";
    
                    console.log(strbuilder + ".\n");
    
                    console.log(`Version Description:`);

                    let introText;

                    if (game.config.branch == "topic") introText = game.config.topicIntroText;
                    else if (game.config.branch == "dev") introText = game.config.developIntroText;
                    else if (game.config.branch == "stable") introText = game.config.stableIntroText;

                    console.log(introText);
                    if (game.config.versionText) console.log(game.config.versionText);
                    console.log();

                    console.log("Todo List:");
                    if (todos.length <= 0) console.log("None.");
                }
                
                print_info();

                // Todo list
                if (todos.length <= 0) {
                    game.input("\nPress enter to continue...");
                    break;
                }

                const print_todo = (todo: [string, string[]], id: number, print_desc = false) => {
                    let [name, info] = todo;
                    let [state, desc] = info;

                    if (state == "done") state = "x";
                    else if (state == "doing") state = "o";
                    else if (state == "not done") state = " ";

                    if (print_desc) console.log(`{${id}} [${state}] ${name}\n${desc}`);
                    else console.log(`{${id}} [${state}] ${name}`);
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
            else console.log(chalk.yellow("Cards that are shown are collected while this screen is rendering. This means that it gets the information about the card from where it is when you ran this command, for example; the graveyard. This is why most cards have <1 health."));

            // History
            let history = game.events.history;
            let finished = "";

            const showCard = (val: Card) => {
                return interact.getReadableCard(val) + " which belongs to: " + chalk.blue(val.plr.name) + ", and has uuid: " + val.uuid.slice(0, 8);
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

                            if (game.config.whitelistedHistoryKeys.includes(key)) {}
                            else return;

                            if (game.config.hideValueHistoryKeys.includes(key)) return;

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

                    if (game.config.whitelistedHistoryKeys.includes(key) || debug) {}
                    else return;

                    // If the `key` is "AddCardToHand", check if the previous history entry was `DrawCard`, and they both contained the exact same `val`.
                    // If so, ignore it.
                    if (key == "AddCardToHand" && i > 0) {
                        let last_entry = history[t][i - 1];

                        if (last_entry[0] == "DrawCard") {
                            if ((last_entry[1] as Card).uuid == (val as Card).uuid) return;
                        }
                    }

                    let shouldHide = game.config.hideValueHistoryKeys.includes(key) && !debug;

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
                console.log(finished);

                game.input("\nPress enter to continue...");
            }

            return finished;
        }

        else if (name.startsWith("/") && !game.config.debug) {
            game.input(chalk.red("You are not allowed to use this command."));
            return false;
        }

        else if (name === "/give") {    
            if (args.length <= 0) {
                game.input(chalk.red("Too few arguments.\n"));
                return false;
            }

            let cardName = args.join(" ");

            let card = game.functions.getCardByName(cardName);
            if (!card) {
                game.input(chalk.red("Invalid card: ") + chalk.yellow(cardName) + chalk.red(".\n"));
                return false;
            }
    
            game.player.addToHand(new Card(card.name, game.player));
        }
        else if (name === "/eval") {
            if (args.length <= 0) {
                game.input(chalk.red("Too few arguments.\n"));
                return -1;
            }

            let log = false;

            if (args[0] == "log") {
                log = true;
                args.shift();
            }

            let code = args.join(" ");

            if (log) {
                if (code[code.length - 1] == ";") code = code.slice(0, -1);

                code = `console.log(${code});game.input();`;
            }
    
            game.evaling = true;
            try {
                eval(code);

                game.events.broadcast("Eval", code, game.player);
            } catch (err) {
                console.log(chalk.red("\nAn error happened while running this code! Here is the error:"));
                console.log(err.stack);
                game.input("Press enter to continue...");
            }
            game.evaling = false;
        }
        else if (name === "/debug") {    
            game.player.maxMaxMana = 1000;
            game.player.maxMana = 1000;
            game.player.mana = 1000;
    
            game.player.health += 10000;
            game.player.armor += 100000;
            game.player.fatigue = 0;
        }
        else if (name === "/undo") {
            // Get the last played card
            if (!game.events.events.PlayCard || game.events.events.PlayCard[game.player.id].length <= 0) {
                game.input(chalk.red("No cards to undo.\n"));
                return false;
            }

            let eventCards: [Card, number][] = game.events.events.PlayCard[game.player.id];
            if (eventCards.length <= 0) {
                game.input(chalk.red("No cards to undo.\n"));
                return false;
            }

            let card = eventCards[eventCards.length - 1][0];

            // Remove the event so you can undo more than the last played card
            game.events.events.PlayCard[game.player.id].pop();

            // If the card can appear on the board, remove it.
            if (card.type === "Minion" || card.type === "Location") {
                game.functions.remove(game.board[game.player.id], card);

                // If the card has 0 or less health, restore it to its original health (according to the blueprint)
                if (card.getHealth() <= 0) {
                    if (!card.stats) throw new Error("Card has no stats!");
                    if (!card.blueprint.stats) throw new Error("Card has no blueprint stats!");

                    card.stats[1] = card.blueprint.stats[1];
                }
            }

            card = card.perfectCopy();

            // If the card is a weapon, destroy it before adding it to the player's hand.
            if (card.type === "Weapon") {
                game.player.destroyWeapon(true);
            }

            // If the card is a hero, reset the player's hero to the default one from their class.
            if (card.type === "Hero") {
                game.player.setToStartingHero();
            }

            game.player.addToHand(card);
            game.player.refreshMana(card.mana);
        }
        else if (name === "/exit") {
            game.running = false;
        }
        else if (name === "/ai") {
            let finished = "";

            if (echo) finished += "AI Info:\n\n";

            for (let i = 1; i <= 2; i++) {
                let plr;
                if (i == 1) plr = game.player1;
                else plr = game.player2;
                if (!plr.ai) continue;

                finished += `AI${i} History: {\n`;

                plr.ai.history.forEach((obj: AIHistory, objIndex: number) => {
                    finished += `${objIndex + 1} ${obj.type}: (${obj.data}),\n`;
                });
                
                finished += "}\n";
            }

            if (echo === false) {}
            else {
                console.log(finished);

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

                console.log(`\nTurn ${i}:`);

                let index = 1;
                obj.forEach(h => {
                    /**
                     * The user's input
                     */
                    let input = h[1];

                    console.log(`[${index++}] ${input}`);
                });
            });

            let turnIndex = parseInt(game.input("\nWhich turn does the command belong to? (eg. 1): "));
            if (!turnIndex || turnIndex < 0 || !history[turnIndex]) {
                game.input(chalk.red("Invalid turn.\n"));
                return false;
            }

            let commandIndex = parseInt(game.input("\nWhat is the index of the command in that turn? (eg. 1): "));
            if (!commandIndex || commandIndex < 1 || !history[turnIndex][commandIndex - 1]) {
                game.input(chalk.red("Invalid command index.\n"));
                return false;
            }

            let command = history[turnIndex][commandIndex - 1][1];
            if (!command) {
                game.input(chalk.red("Invalid command.\n"));
                return false;
            }

            command = command as EventValue<"Input">;

            interact.printAll();
            let options = parseInt(game.input(`\nWhat would you like to do with this command?\n${command}\n\n(1. Run it, 2. Cancel): `));
            if (!options || options === 2) {
                game.input(chalk.red("Invalid option.\n"));
                return false;
            }

            if (options === 1) {
                interact.doTurnLogic(command);
            }
        }
        else if (name === "/set") {
            if (args.length != 2) {
                game.input(chalk.red("Invalid amount of arguments!\n"));
                return false;
            }

            let [key, value] = args;

            let name = Object.keys(game.config).find(k => k === value);
            if (!name) {
                game.input(chalk.red("Invalid setting name!\n"));
                return false;
            }

            // @ts-expect-error - Strict mode can't index object by string, even though we null check it immediately, so we have to do this
            let setting: GameConfig = game.config[name];

            if (setting === undefined) {
                game.input(chalk.red("Invalid setting name!\n"));
                return false;
            }

            if (!(/number|boolean|string/.test(typeof setting))) {
                game.input(chalk.red(`You cannot change this setting, as it is a '${typeof setting}', and you can only change: number, boolean, string.\n`));
                return false;
            }

            if (key == "debug") {
                game.input(chalk.red("You can't change the debug setting, as that could lock you out of the set command.\n"));
                return false;
            }

            let newValue;

            if (["off", "disable", "false", "no", "0"].includes(value)) {
                console.log(chalk.greenBright(`Setting '${key}' has been disabled.`));
                newValue = false;
            }
            else if (["on", "enable", "true", "yes", "1"].includes(value)) {
                console.log(chalk.greenBright(`Setting '${key}' has been disabled.`));
                newValue = true;
            }
            else if (parseFloat(value)) {
                console.log(chalk.greenBright(`Setting '${key}' has been set to the float: ${value}.`));
                newValue = parseFloat(value);
            }
            else if (parseInt(value)) {
                console.log(chalk.greenBright(`Setting '${key}' has been set to the integer: ${value}.`));
                newValue = parseInt(value);
            }
            else {
                console.log(chalk.greenBright(`Setting '${key}' has been set to the string literal: ${value}.`));
                newValue = value;
            }

            if (newValue === undefined) {
                // This should never really happen
                game.input(chalk.red("Invalid value!\n"));
                return false;
            }

            // @ts-expect-error - We already know that the key is a valid config setting.
            game.config[key] = newValue;
            game.doConfigAI();
            
            game.input();
        }
        else if (name === "/reload" || name === "/rl") {
            if (game.config.reloadCommandConfirmation && !debug) {
                let sure = interact.yesNoQuestion(game.player, chalk.yellow("Are you sure you want to reload? This will reset all cards to their base state."));
                if (!sure) return false;
            }

            let success = true;

            success = success && interact.withStatus("Reloading cards", () => {
                game.cards = reloadCards(game.functions.dirname() + "cards");
                return true;
            });

            success = success && interact.withStatus("Importing config", () => game.functions.importConfig(game.functions.dirname() + "config"));
                
            // Go through all the cards and reload them
            success = success && interact.withStatus("Reloading cards", () => {
                /**
                 * Reloads a card
                 */
                const reload = (card: Card) => {
                    let clonedCard = card.imperfectCopy();

                    card.doBlueprint();
                    card.backups["init"] = clonedCard.backups["init"];
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
            if (!success) game.input("\nSome steps failed. The game could not be fully reloaded. Please report interact.\nPress enter to continue...");
        }
        else if (name === "/freload" || name === "/frl") {
            return interact.handleCmds("/reload", true, true);
        }
        else if (name === "/history") {
            return interact.handleCmds("history", true, true);
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
        if (interact.handleCmds(input) !== -1) return true;
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
        game.events.tick("GameLoop", "doTurn");

        if (game.player.ai) {
            let input;

            const rawInput = game.player.ai.calcMove();
            if (!rawInput) return false;
            if (rawInput instanceof Card) input = (game.player.hand.indexOf(rawInput) + 1).toString();
            else input = rawInput;

            let turn = interact.doTurnLogic(input);

            game.killMinions();

            return turn;
        }

        interact.printAll();
    
        let input = "\nWhich card do you want to play? ";
        if (game.turns <= 2 && !game.config.debug) input += "(type 'help' for further information <- This will disappear once you end your turn) ";
    
        let user = game.input(input);
        const ret = interact.doTurnLogic(user);
        game.killMinions();

        if (ret === true || ret instanceof Card) return ret; // If there were no errors, return true.
        if (["refund", "magnetize", "traded", "colossal"].includes(ret)) return ret; // Ignore these error codes
        let err;

        // Get the card
        let card = game.player.hand[parseInt(user) - 1];
        let cost = "mana";
        if (card) cost = card.costType;

        // Error Codes
        if (ret == "mana") err = `Not enough ${cost}`;
        else if (ret == "counter") err = "Your card has been countered";
        else if (ret == "space") err = `You can only have ${game.config.maxBoardSpace} minions on the board`;
        else if (ret == "invalid") err = "Invalid card";
        else err = `An unknown error occurred. Error code: UnexpectedDoTurnResult@${ret}`;

        console.log(chalk.red(`${err}.`));
        game.input();

        return false;
    },

    /**
     * Asks the user to select a location card to use, and activate it.
     * 
     * @return Success
     */
    useLocation(): boolean | "nolocations" | "invalidtype" | "cooldown" | -1 {
        let locations = game.board[game.player.id].filter(m => m.type == "Location");
        if (locations.length <= 0) return "nolocations";

        let location = interact.selectCardTarget("Which location do you want to use?", null, "friendly", ["allow_locations"]);
        if (!location) return -1;

        if (location.type != "Location") return "invalidtype";
        if (location.cooldown && location.cooldown > 0) return "cooldown";
        
        if (location.activate("use") === game.constants.REFUND) return -1;
        
        location.setStats(0, location.getHealth() - 1);
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
        interact.printName();
    
        /**
         * If the test deck (30 Sheep) should be allowed
         */
        let allowTestDeck: boolean = game.config.debug || game.config.branch !== "stable";

        let debugStatement = allowTestDeck ? chalk.gray(" (Leave this empty for a test deck)") : "";
        const deckcode = game.input(`Player ${plr.id + 1}, please type in your deckcode${debugStatement}: `);

        let result: boolean | Card[] | null = true;

        if (deckcode.length > 0) result = game.functions.deckcode.import(plr, deckcode);
        else {
            if (!allowTestDeck) { // I want to be able to test without debug mode on in a non-stable branch
                // Give error message
                game.input(chalk.red("Please enter a deckcode!\n"));
                return false;
            }

            // Debug mode is enabled, use the 30 Sheep debug deck.
            while (plr.deck.length < 30) plr.deck.push(new Card("Sheep", plr)); // Debug deck
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
        interact.printAll(plr);

        let sb = "\nChoose the cards to mulligan (1, 2, 3, ...):\n";
        if (!game.config.debug) sb += chalk.gray("(Example: 13 will mulligan the cards with the ids 1 and 3, 123 will mulligan the cards with the ids 1, 2 and 3, just pressing enter will not mulligan any cards):\n");

        let input;

        if (plr.ai) input = plr.ai.mulligan();
        else input = game.input(sb);

        let is_int = game.functions.mulligan(plr, input);

        if (!is_int && input != "") {
            game.input(chalk.red("Invalid input!\n"));
            return interact.mulligan(plr);
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
        // Look at the bottom three cards of the deck and put one on the top.
        let cards = game.player.deck.slice(0, 3);

        // Check if ai
        if (game.player.ai) {
            let card = game.player.ai.dredge(cards);
            if (!card) return null;

            game.functions.remove(game.player.deck, card); // Removes the selected card from the players deck.
            game.player.deck.push(card);

            return card;
        }

        interact.printAll();

        console.log(`\n${prompt}`);

        if (cards.length <= 0) return null;

        cards.forEach((c, i) => {
            console.log(interact.getReadableCard(c, i + 1));
        });

        let choice = game.input("> ");

        const cardId = parseInt(choice) - 1;
        let card = cards[cardId];

        if (!card) {
            return interact.dredge(prompt);
        }

        game.functions.remove(game.player.deck, card); // Removes the selected card from the players deck.
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
        interact.printAll();

        let choices = [];

        for (let i = 0; i < times; i++) {
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
                game.input(chalk.red("Invalid input!\n"));
                return interact.chooseOne(prompt, options, times);
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
        const RETRY = () => {
            return interact.question(plr, prompt, answers);
        }

        interact.printAll(plr);

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
            game.input(chalk.red("Invalid input!\n"));
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
        interact.printAll(plr);

        let ask = `\n${prompt} [` + chalk.greenBright('Y') + ' | ' + chalk.red('N') + `] `;

        if (plr.ai) return plr.ai.yesNoQuestion(prompt);

        let _choice = game.input(ask);
        let choice = _choice.toUpperCase()[0];

        if (["Y", "N"].includes(choice)) return choice === "Y";

        // Invalid input
        console.log(chalk.red("Unexpected input: '") + chalk.yellow(_choice) + chalk.red("'. Valid inputs: ") + "[" + chalk.greenBright("Y") + " | " + chalk.red("N") + "]");
        game.input();

        return interact.yesNoQuestion(plr, prompt);
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
        // Discover doesn't work
        interact.printAll();
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
            values = game.functions.chooseItemsFromList(cards, amount).map(c => c.copy);
        }

        if (values.length <= 0) return null;

        if (game.player.ai) return game.player.ai.discover(values);

        console.log(`\n${prompt}:`);

        values.forEach((v, i) => {
            let card = game.functions.getCardByName(v.name);
            if (!card) return;

            console.log(interact.getReadableCard(v, i + 1));
        });

        let choice = game.input();

        if (!values[parseInt(choice) - 1]) {
            // Invalid input
            // We still want the user to be able to select a card, so we force it to be valid
            return interact.discover(prompt, cards, filterClassCards, amount, values);
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
        return interact.selectTarget(prompt, card, "any", "hero", flags) as Player | false;
    },

    /**
     * Like `selectTarget` but restricts the user to selecting minions.
     * 
     * The advantage of this function is that it returns `Card | false` instead of `Target | false`.
     */
    selectCardTarget(prompt: string, card: Card | null, side: SelectTargetAlignment, flags: SelectTargetFlag[] = []): Card | false {
        return interact.selectTarget(prompt, card, side, "minion", flags) as Card | false;
    },

    /**
     * #### You might want to use `interact.selectPlayerTarget` or `interact.selectCardTarget` instead.
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
        game.events.broadcast("TargetSelectionStarts", [prompt, card, force_side, force_class, flags], game.player);
        let target = interact._selectTarget(prompt, card, force_side, force_class, flags);

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
        if (target.startsWith("b")) {
            return false; // This should always be safe.
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
            game.input(chalk.red("Invalid input / minion!\n"));

            return interact._selectTarget(prompt, card, force_side, force_class, flags);
        }

        // If the player is forced to one side.
        if (force_side === "any") {
            // If the player chose to target a hero, it will ask which hero.
            if (target.startsWith("face") && force_class != "minion") return interact._selectTarget(prompt, card, force_side, "hero", flags);
            
            // If both players have a minion with the same index,
            // ask them which minion to select
            if (board_opponent.length >= parseInt(target) && board_friendly.length >= parseInt(target)) {
                const oName = game.functions.colorByRarity(board_opponent_target.displayName, board_opponent_target.rarity);
                const fName = game.functions.colorByRarity(board_friendly_target.displayName, board_friendly_target.rarity);

                let alignment = game.input(`Do you want to select your opponent's (${oName}) or your own (${fName})? (y: opponent, n: friendly | type 'back' to go back) `);
            
                if (alignment.startsWith("b")) {
                    // Go back.
                    return interact._selectTarget(prompt, card, force_side, force_class, flags);
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
            game.input(chalk.red("Invalid minion.\n"));
            return false;
        }

        // If the minion has elusive, and the card that called this function is a spell
        if ((card && card.type === "Spell") || flags.includes("force_elusive")) {
            if (minion.keywords.includes("Elusive")) {
                game.input(chalk.red("Can't be targeted by Spells or Hero Powers.\n"));
            
                return false;
            }

            game.events.broadcast("CastSpellOnMinion", [card, minion], game.player);
        }

        // If the minion has stealth, don't allow the opponent to target it.
        if (minion.keywords.includes("Stealth") && game.player != minion.plr) {
            game.input(chalk.red("This minion has stealth.\n"));

            return false;
        }

        // If the minion is a location, don't allow it to be selectted unless the `allow_locations` flag was set.
        if (minion.type == "Location" && !flags.includes("allow_locations")) {
            game.input(chalk.red("You cannot target location cards.\n"));

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
    
        let watermarkString = `HEARTHSTONE.JS V${game.config.version}-${game.config.branch}`;
        let border = "-".repeat(watermarkString.length + 2);
    
        console.log(`|${border}|`);
        console.log(`| ${watermarkString} |`);
        console.log(`|${border}|\n`);

        if (game.config.branch == "topic" && game.config.topicBranchWarning) console.log("WARNING: YOU ARE ON A TOPIC BRANCH. THIS VERSION IS NOT READY.\n");
    },

    /**
     * Prints some license info
     * 
     * @param disappear If this is true, "This will disappear once you end your turn" will show up.
     */
    printLicense(disappear: boolean = true): void {
        if (game.config.debug) return;
    
        cls();
    
        let version = `Hearthstone.js V${game.config.version}-${game.config.branch} | Copyright (C) 2022 | LunarTides`;
        console.log('|'.repeat(version.length + 8));
        console.log(`||| ${version} |||`)
        console.log(`|||     This program is licensed under the GPL-3.0 license.   ` + ' '.repeat(game.config.branch.length) + "|||")
        if (disappear)
        console.log(`|||         This will disappear once you end your turn.       ` + ' '.repeat(game.config.branch.length) + `|||`)
        console.log('|'.repeat(version.length + 8));
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
        let reg = new RegExp(`{ph:(.*?)} .*? {/ph}`);

        let desc = overrideDesc;
        if (!overrideDesc) desc = card.desc || "";

        while (true) {
            let regedDesc = reg.exec(desc);
            
            // There is nothing more to extract
            if (!regedDesc) break;

            let key = regedDesc[1]; // Gets the capturing group result

            let _replacement = card.placeholder;
            if (!_replacement) throw new Error("Card placeholder not found.");

            let replacement = _replacement[key];

            if (replacement instanceof Card) {
                // The replacement is a card
                let onlyShowName = (
                    game.config.getReadableCardNoRecursion ||
                    !game.player.detailedView
                );
                
                if (onlyShowName && !game.config.getReadableCardAlwaysShowFullCard) {
                    // Only show the name of the card
                    replacement = game.functions.colorByRarity(replacement.displayName, replacement.rarity);
                }
                else {
                    // Show the full card using recursion
                    replacement = interact.getReadableCard(replacement, -1, _depth + 1);
                }
            }

            desc = desc.replace(reg, replacement);
        }

        // Replace spell damage placeholders
        reg = /\$(\d+?)/;

        while (true) {
            let regedDesc = reg.exec(desc);
            if (!regedDesc) break;

            let key = regedDesc[1]; // Gets the capturing group result
            let replacement = parseInt(key) + game.player.spellDamage;

            desc = desc.replace(reg, replacement.toString());
        }

        return desc;
    },

    /**
     * Returns a card in a user readble state. If you console.log the result of this, the user will get all the information they need from the card.
     *
     * @param card The card
     * @param i If this is set, this function will add `[i]` to the beginning of the card. This is useful if there are many different cards to choose from.
     * @param _depth The depth of recursion. DO NOT SET THIS MANUALLY.
     * 
     * @returns The readable card
     */
    getReadableCard(card: CardLike, i: number = -1, _depth: number = 0): string {
        /**
         * If it should show detailed errors regarding depth.
         */
        let showDetailedError: boolean = (game.config.debug || game.config.branch !== "stable" || game.player.detailedView);

        if (_depth > 0 && game.config.getReadableCardNoRecursion) {
            if (showDetailedError) return "RECURSION ATTEMPT BLOCKED";
            else return "...";
        }

        if (_depth > game.config.getReadableCardMaxDepth) {
            if (showDetailedError) return "MAX DEPTH REACHED";
            else return "...";
        }

        let sb = "";

        let desc;

        if (card instanceof Card) desc = (card.desc || "").length > 0 ? ` (${card.desc}) ` : " ";
        else desc = card.desc.length > 0 ? ` (${game.functions.parseTags(card.desc)}) ` : " ";

        // Extract placeholder value, remove the placeholder header and footer
        if (card instanceof Card && (card.placeholder || /\$(\d+?)/.test(card.desc || ""))) {
            desc = interact.doPlaceholders(card, desc, _depth);
        }

        let mana = `{${card.mana}} `;

        let costType = "mana";
        if (card instanceof Card && card.costType) costType = card.costType;

        switch (costType) {
            case "mana":
                mana = chalk.cyan(mana);
                break;
            case "armor":
                mana = chalk.gray(mana);
                break;
            case "health":
                mana = chalk.red(mana);
                break;
            default:
                break;
        }

        let displayName = card.name;
        if (card instanceof Card) displayName = card.displayName;

        if (i !== -1) sb += `[${i}] `;
        sb += mana;
        sb += game.functions.colorByRarity(displayName, card.rarity);
        
        if (card.type === "Minion" || card.type === "Weapon") {
            sb += chalk.greenBright(` [${card.stats?.join(" / ")}]`);
        }

        sb += desc;
        sb += chalk.yellow(`(${card.type})`);

        return sb;
    },

    /**
     * Prints all the information you need to understand the game state
     * 
     * @param plr The player
     */
    printAll(plr?: Player): void {
        // WARNING: Stinky and/or smelly code up ahead. Read at your own risk.
        // TODO: #246 Reformat this

        if (!plr) plr = game.player;

        if (game.turns <= 2 && !game.config.debug) interact.printLicense();
        else interact.printName();
    
        let op = plr.getOpponent();
    
        let sb = "";
    
        console.log(chalk.gray("Your side  :                              | Your opponent's side"));
        /// Mana
        // Current Player's Mana
        sb += `Mana       : ${chalk.cyan(plr.mana)} / ${chalk.cyan(plr.maxMana)}`;
        sb += "                        | ";

        // TODO: Yeah no. Replace all of these.
        let to_remove = (plr.mana.toString().length + plr.maxMana.toString().length) - 2;
        if (to_remove > 0) sb = sb.replace(" ".repeat(to_remove) + "|", "|");

        // Opponent's Mana
        sb += `Mana       : ${chalk.cyan(op.mana)} / ${chalk.cyan(op.maxMana)}`;
        // Mana End
        console.log(sb);
        sb = "";
        
        // Health
        sb += `Health     : ${chalk.red(plr.health)} (${chalk.gray(plr.armor)}) / ${chalk.red(plr.maxHealth)}`;

        sb += "                       | ";
        to_remove = (plr.health.toString().length + plr.armor.toString().length + plr.maxHealth.toString().length);
        if (to_remove > 0) sb = sb.replace(" ".repeat(to_remove) + "|", "|");
    
        // Opponent's Health
        sb += `Health     : ${chalk.red(op.health)} (${chalk.gray(op.armor)}) / ${chalk.red(op.maxHealth)}`;
        // Health End
        console.log(sb);
        sb = "";

        // Weapon
        if (plr.weapon) {
            // Current player has a weapon
            // Attack: 1 | Weapon: Wicked Knife (1 / 1)
            sb += `Weapon     : ${game.functions.colorByRarity(plr.weapon.displayName, plr.weapon.rarity)}`;

            let wpnStats = ` [${plr.weapon.stats?.join(' / ')}]`;

            sb += (plr.attack > 0 && plr.canAttack) ? chalk.greenBright(wpnStats) : chalk.gray(wpnStats);
        }
        else if (plr.attack) {
            sb += `Attack     : ${chalk.greenBright(plr.attack)}`;
        }
    
        if (op.weapon) {
            // Opponent has a weapon
            if (!plr.weapon) sb += "                                 "; // Show that this is the opponent's weapon, not yours
            
            sb += "         | "; 
            sb += `Weapon     : ${chalk.bold(op.weapon.displayName)}`;
            let opWpnStats = ` [${op.weapon.stats?.join(' / ')}]`;

            sb += (op.attack > 0) ? chalk.greenBright(opWpnStats) : chalk.gray(opWpnStats);
        }
    
        // Weapon End
        if (sb) console.log(sb);
        sb = "";
    
        // Deck
        sb += `Deck Size  : ${chalk.yellow(plr.deck.length)}`;

        sb += "                            | ";
        to_remove = (plr.deck.length.toString().length + op.deck.length.toString().length) - 3;
        if (to_remove > 0) sb = sb.replace(" ".repeat(to_remove) + "|", "|");
    
        // Opponent's Deck
        sb += `Deck Size  : ${chalk.yellow(op.deck.length)}`;
        // Deck End
        console.log(sb);
        sb = "";

        // Secrets
        if (plr.secrets.length > 0) {
            sb += "Secrets: ";
            sb += plr.secrets.map(x => chalk.bold(x.name)).join(', '); // Get all your secret's names
        }
        // Secrets End
        if (sb) console.log(sb);
        sb = "";
    
        // Sidequests
        if (plr.sidequests.length > 0) {
            sb += "Sidequests: ";
            sb += plr.sidequests.map(sidequest => {
                chalk.bold(sidequest.name) +
                " (" + chalk.greenBright(sidequest.progress[0]) +
                " / " + chalk.greenBright(sidequest.progress[1]) +
                ")"
            }).join(', ');
        }
        // Sidequests End
        if (sb) console.log(sb);
        sb = "";
    
        // Quests
        if (plr.quests.length > 0) {
            const quest = plr.quests[0];
    
            sb += `Quest(line): ${chalk.bold(quest.name)} `;
            sb += chalk.greenBright(`[${quest.progress[0]} / ${quest.progress[1]}]`);
        }
        // Quests End
        if (sb) console.log(sb);
        sb = "";
    
        // Detailed Info
        if (plr.detailedView) {
            // Hand Size
            sb += `Hand Size  : ${chalk.yellow(plr.hand.length)}`;

            sb += "                             | ";
            to_remove = plr.hand.length.toString().length;
            if (to_remove > 0) sb = sb.replace(" ".repeat(to_remove) + "|", "|");

            // Opponents Hand Size
            sb += `Hand Size  : ${chalk.yellow(op.hand.length)}`;

            console.log(sb);
            sb = "";

            // Corpses
            sb += chalk.gray("Corpses    : ");
            sb += chalk.yellow(plr.corpses);
            
            sb += "                             | ";
            to_remove = plr.corpses.toString().length;
            if (to_remove > 0) sb = sb.replace(" ".repeat(to_remove) + "|", "|");

            // Opponents Corpses
            sb += chalk.gray("Corpses    : ");
            sb += chalk.yellow(op.corpses.toString());

            sb += "\n-------------------------------\n";
    
            if (op.secrets.length > 0) {
                sb += `Opponent's Secrets: ${chalk.yellow(op.secrets.length)}\n`;
            }
    
            if (op.sidequests.length > 0) {
                sb += "Opponent's Sidequests: ";
                sb += op.sidequests.map(sidequest => {
                    chalk.bold(sidequest.name) +
                    " (" +
                    chalk.greenBright(sidequest.progress[0]) +
                    " / " +
                    chalk.greenBright(sidequest.progress[1]) +
                    ")"
                }).join(', ');
    
                sb += "\n";
            }
            
            if (op.quests.length > 0) {
                const quest = op.quests[0];
    
                sb += "Opponent's Quest(line): ";
                sb += chalk.bold(quest["name"]);
                sb += " (";
                sb += chalk.greenBright(quest.progress[0]);
                sb += " / ";
                sb += chalk.greenBright(quest.progress[1]);
                sb += ")";
    
                sb += "\n";
            }
        }
        // Detailed Info End
        if (sb) console.log(sb);
        sb = "";
    
        // Board
        console.log("\n--- Board ---");

        game.board.forEach((_, i) => {
            const t = (i == plr?.id) ? "--- You ---" : "--- Opponent ---";
    
            console.log(t) // This is not for debugging, do not comment out
    
            if (game.board[i].length == 0) {
                console.log(chalk.gray("(None)"));
                return;
            }
    
            game.board[i].forEach((m, n) => {
                if (m.type == "Location") {            
                    sb += `[${n + 1}] `;
                    sb += chalk.bold(`${m.displayName} `);
                    sb += "{";
                    sb += chalk.greenBright(`Durability: ${m.getHealth()} / `);
                    sb += chalk.greenBright(m.backups.init.stats?[1] : 0);
                    sb += ", ";
        
                    sb += chalk.cyan(`Cooldown: ${m.cooldown} / ${m.backups.init.cooldown}`);
                    sb += "}";

                    sb += chalk.yellow(" [Location]");
        
                    console.log(sb);
                    sb = "";

                    return;
                }

                const excludedKeywords = ["Magnetic", "Corrupt", "Corrupted"];
                let keywords = m.keywords.filter(k => !excludedKeywords.includes(k));
                let keywordsString = keywords.length > 0 ? chalk.gray(` {${keywords.join(", ")}}`) : "";

                let frozen = m.frozen ? chalk.gray(" (Frozen)") : "";
                let dormant = m.dormant ? chalk.gray(" (Dormant)") : "";
                let immune = m.immune ? chalk.gray(" (Immune)") : "";
                let sleepy = (m.sleepy) || (m.attackTimes && m.attackTimes <= 0) ? chalk.gray(" (Sleepy)") : "";
    
                sb += `[${n + 1}] `;
                sb += game.functions.colorByRarity(m.displayName, m.rarity);
                sb += chalk.greenBright(` [${m.stats?.join(" / ")}]`);
    
                sb += keywordsString;
                sb += frozen
                sb += dormant;
                if (!m.dormant) sb += immune
                sb += sleepy;
    
                console.log(sb);
                sb = "";
            });
        });
        console.log("-------------")
    
        let _class = plr.hero?.name.includes("Starting Hero") ? plr.heroClass : plr.hero?.name;
        if (plr.detailedView && plr.hero?.name.includes("Starting Hero")) {
            _class += " | ";
            _class += "HP: ";
            _class += plr.hero.name;
        }
    
        // Hand
        console.log(`\n--- ${plr.name} (${_class})'s Hand ---`);
        console.log("([id] " + chalk.cyan("{Cost}") + chalk.bold(" Name") + chalk.greenBright(" [attack / health]") + chalk.yellow(" (type)") + ")\n");
    
        plr.hand.forEach((card, i) => console.log(interact.getReadableCard(card, i + 1)));
        // Hand End
    
        console.log("------------");
    },

    /**
     * Shows information from the card, console.log's it and waits for the user to press enter.
     *
     * @param card The card
     * @param help If it should show a help message which displays what the different fields mean.
     */
    viewCard(card: CardLike, help: boolean = true) {
        let _card = interact.getReadableCard(card);
        let _class = chalk.gray(card.classes.join(" / "));

        let tribe = "";
        let spellClass = "";
        let locCooldown = "";

        let type = card.type;

        if (type == "Minion") tribe = " (" + chalk.gray(card.tribe ?? "None") + ")";
        else if (type == "Spell") {
            if (card.spellClass) spellClass = " (" + chalk.cyan(card.spellClass) + ")";
            else spellClass = " (None)";
        }
        else if (type == "Location") {
            if (card instanceof Card) locCooldown = " (" + chalk.cyan(card.blueprint.cooldown ?? 0) + ")";
            else locCooldown = " (" + chalk.cyan(card.cooldown?.toString()) + ")";
        }

        if (help) console.log(chalk.cyan("{mana} ") + chalk.bold("Name ") + "(" + chalk.greenBright("[attack / health] ") + "if it has) (description) " + chalk.yellow("(type) ") + "((tribe) or (spell class) or (cooldown)) [" + chalk.gray("class") + "]");
        console.log(_card + tribe + spellClass + locCooldown + ` [${_class}]`);

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
        if (condition) console.log("Success! You did it, well done!");
        else console.log(`Hm. This card doesn't seem to do what it's supposed to do... Maybe you should try to fix it? The card is in: './cards/Examples/DIY/${fileName}'.`);
        
        game.input();
        return true;
    },

    /**
     * Clears the screen.
     */
    cls() { // Do this so it doesn't crash because of "strict mode"
        cls();
    },
}

const cls = () => process.stdout.write('\x1bc');
