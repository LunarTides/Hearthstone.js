import rl from 'readline-sync';
import { AI, Card, Player } from "../../internal.js";
import { AIHistory, EventValue, GameConfig, GamePlayCardReturn } from "@Game/types.js";
import { reloadCards } from "../../helper/cards.js";

const licenseUrl = 'https://github.com/LunarTides/Hearthstone.js/blob/main/LICENSE';

// Override the console methods to force using the wrapper functions
// Set this variable to false to prevent disabling the console. (Not recommended)
const disableConsole = true;

const overrideConsole = {log: (...data: any[]) => {}, warn: (...data: any[]) => {}, error: (...data: any[]) => {}};
overrideConsole.log = console.log;
overrideConsole.warn = console.warn;
overrideConsole.error = console.error;

if (disableConsole) {
    console.log = (..._) => {
        throw new Error("Use `game.log` instead.")
    };
    console.warn = (..._) => {
        throw new Error("Use `game.logWarn` instead.")
    };
    console.error = (..._) => {
        throw new Error("Use `game.logError` instead.")
    };
}

export const GameLoopInteract = {    /**
     * Ask the user a question and returns their answer
     *
     * @param q The question to ask
     * @param care If this is false, it overrides `game.noInput`. Only use this when debugging.
     *
     * @returns What the user answered
     */
    input(q: string = "", care: boolean = true, useInputQueue: boolean = true): string {
        const wrapper = (a: string) => {
            if (game.player instanceof Player) game.events.broadcast("Input", a, game.player);

            if (game.replaying && useInputQueue) this.promptReplayOptions();

            return a;
        }

        if (game.noOutput) q = "";
        if (game.noInput && care) return wrapper("");

        q = game.functions.color.fromTags(q);

        // Let the game make choices for the user
        if (game.player.inputQueue && useInputQueue) {
            const queue = game.player.inputQueue;

            if (typeof(queue) == "string") return wrapper(queue);

            // Invalid queue
            else if (!(queue instanceof Array)) return wrapper(rl.question(q));

            const answer = queue[0];
            queue.splice(0, 1);

            if (queue.length <= 0) game.player.inputQueue = undefined;

            return wrapper(answer);
        }

        return wrapper(rl.question(q));
    },

    /**
     * Helper function for the `game.log` functions. Don't use.
     */
    logWrapper(callback: (...data: any) => void, ...data: any) {
        if (game.noOutput) return;

        data = data.map((i: any) => typeof i === "string" ? game.functions.color.fromTags(i) : i);
        return callback(...data);
    },

    /**
     * Wrapper for console.log 
     */
    log(...data: any) {
        return this.logWrapper(overrideConsole.log, ...data);
    },

    /**
     * Wrapper for console.error
     */
    logError(...data: any) {
        return this.logWrapper(overrideConsole.error, ...data);
    },

    /**
     * Wrapper for console.warn
     */
    logWarn(...data: any) {
        return this.logWrapper(overrideConsole.warn, ...data);
    },

    /**
     * Asks the user to attack a minion or hero
     *
     * @returns Cancel | Success
     */
    doTurnAttack(): -1 | null | boolean | Card {
        let attacker, target;

        if (game.player.ai) {
            let ai

            const altModel = `legacyAttack${game.config.ai.attackModel}`;

            // Run the correct ai attack model
            const model = game.player.ai[altModel as keyof AI];
            if (model) ai = (model as Function)();

            // Use the latest model
            else ai = game.player.ai.attack();

            attacker = ai[0];
            target = ai[1];

            if (attacker === -1 || target === -1) return -1;
            if (attacker === null || target === null) return null;
        } else {
            attacker = game.interact.selectTarget("Which minion do you want to attack with?", null, "friendly", "any");
            if (!attacker) return false;

            target = game.interact.selectTarget("Which minion do you want to attack?", null, "enemy", "any");
            if (!target) return false;
        }
    
        const errorcode = game.attack(attacker, target);
        game.killMinions();

        const ignore = ["divineshield"];
        if (errorcode === true || ignore.includes(errorcode)) return true;
        let err

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
    handleCmds(q: string, flags?: { echo?: boolean, debug?: boolean }): boolean | string | -1 {
        const args = q.split(" ");
        const name = args.shift()?.toLowerCase();
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

            game.interact.info.printAll(game.player);
            const ask = game.interact.yesNoQuestion(game.player, `<yellow>${game.player.hero?.hpText}</yellow> Are you sure you want to use this hero power?`);
            if (!ask) return false;

            game.interact.info.printAll(game.player);
            game.player.heroPower();
        }
        else if (name === "attack") {
            this.doTurnAttack();
            game.killMinions();
        }
        else if (name === "use") {
            // Use location
            const errorcode = game.interact.card.useLocation();
            game.killMinions();

            if (errorcode === true || errorcode === -1 || game.player.ai) return true;
            let err

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
            game.interact.info.printName();
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

            const condColor = (str: string) => {return (game.config.general.debug) ? str : `<gray>${str}</gray>`};

            game.log(condColor("\n--- Debug Commands (") + ((game.config.general.debug) ? "<bright:green>ON</bright:green>" : "<red>OFF</red>") + condColor(") ---"));
            game.log(condColor("/give (name)        - Adds a card to your hand"));
            game.log(condColor("/eval [log] (code)  - Runs the code specified. If the word 'log' is before the code, instead game.log the code and wait for user input to continue."));
            game.log(condColor("/set (name) (value) - Changes a setting to (value). Look in the config files for a list of settings."));
            game.log(condColor("/debug              - Gives you infinite mana, health and armor"));
            game.log(condColor("/exit               - Force exits the game. There will be no winner, and it will take you straight back to the runner."));
            game.log(condColor("/history            - Displays a history of actions. This doesn't hide any information, and is the same thing the log files uses."));
            game.log(condColor("/reload | /rl       - Reloads the cards and config in the game (Use '/freload' or '/frl' to ignore the confirmation prompt (or disable the prompt in the advanced config))"));
            game.log(condColor("/undo               - Undoes the last card played. It gives the card back to your hand, and removes it from where it was. (This does not undo the actions of the card)"));
            game.log(condColor("/cmd                - Shows you a list of debug commands you have run, and allows you to rerun them."));
            game.log(condColor("/ai                 - Gives you a list of the actions the ai(s) have taken in the order they took it"));
            game.log(condColor("---------------------------" + ((game.config.general.debug) ? "" : "-")));
            
            game.input("\nPress enter to continue...\n");
        }
        else if (name === "view") {
            const isHandAnswer = game.interact.question(game.player, "Do you want to view a minion on the board, or in your hand?", ["Board", "Hand"]);
            const isHand = isHandAnswer == "Hand";

            if (!isHand) {
                // allowLocations Makes selecting location cards allowed. This is disabled by default to prevent, for example, spells from killing the card.
                const minion = game.interact.selectCardTarget("Which minion do you want to view?", null, "any", ["allowLocations"]);
                if (!minion) return false;
        
                game.interact.card.view(minion);

                return true;
            }

            // View minion on the board
            const cardId = game.input("\nWhich card do you want to view? ");
            if (!cardId || !parseInt(cardId)) return false;

            const card = game.player.hand[parseInt(cardId) - 1];

            game.interact.card.view(card);
        }
        else if (name === "detail") {
            game.player.detailedView = !game.player.detailedView;
        }
        else if (name === "concede") {
            game.interact.info.printAll(game.player);
            const confirmation = game.interact.yesNoQuestion(game.player, "Are you sure you want to concede?");
            if (!confirmation) return false;

            game.endGame(game.player.getOpponent());
        }
        else if (name === "license") {
            const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
            game.functions.util.runCommand(start + ' ' + licenseUrl);
        }
        else if (name === "version") {
            const version = game.config.info.version;
            const branch = game.config.info.branch;
            const build = game.config.info.build;

            while (true) {
                const todos = Object.entries(game.config.todo);

                const printInfo = () => {
                    game.interact.info.printAll(game.player);

                    let strbuilder = `\nYou are on version: ${version}, on `;
    
                    if (branch == "topic") strbuilder += "a topic branch";
                    else if (branch == "alpha") strbuilder += "the alpha branch";
                    else if (branch == "beta") strbuilder += "the beta branch";
                    else if (branch == "stable") strbuilder += "the stable (release) branch";

                    strbuilder += `, on build ${build}`;
                    strbuilder += `, with latest commit hash '${game.functions.info.latestCommit()}',`
    
                    if (game.config.general.debug === true && game.config.ai.player2 === true) strbuilder += " using the debug settings preset";
                    else if (game.config.general.debug === false && game.config.ai.player2 === false) strbuilder += " using the recommended settings preset";
                    else strbuilder += " using custom settings";
    
                    game.log(strbuilder + ".\n");
    
                    game.log(`Version Description:`);

                    let introText

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
                
                printInfo();

                // Todo list
                if (todos.length <= 0) {
                    game.input("\nPress enter to continue...");
                    break;
                }

                const printTodo = (todo: any, id: number, printDesc = false) => {
                    const [name, info] = todo;
                    let [state, text] = info;

                    if (state == "done") state = "x";
                    else if (state == "doing") state = "o";
                    else if (state == "not done") state = " ";

                    if (printDesc) game.log(`{${id}} [${state}] ${name}\n${text}`);
                    else game.log(`{${id}} [${state}] ${name}`);
                }

                todos.forEach((e, i) => printTodo(e, i + 1));

                const todoId = parseInt(game.input("\nType the id of a todo to see more information about it (eg. 1): "));
                if (!todoId || todoId > todos.length || todoId <= 0) {
                    break;
                }

                const todo = todos[todoId - 1];

                printInfo();
                printTodo(todo, todoId, true);
                
                game.input("\nPress enter to continue...");
            }
        }
        else if (name === "history") {
            if (flags?.echo === false) {}
            else game.log("<yellow>Cards that are shown are collected while this screen is rendering. This means that it gets the information about the card from where it is when you ran this command, for example; the graveyard. This is why most cards have <1 health.</yellow>");

            // History
            const history = game.events.history;
            let finished = "";

            const showCard = (val: Card) => {
                return `${game.interact.card.getReadable(val)} which belongs to: <blue>${val.plr.name}</blue>, and has uuid: ${val.uuid.slice(0, 8)}`;
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

                            const [key, newVal, _] = c;

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

                    if (game.config.advanced.whitelistedHistoryKeys.includes(key) || flags?.debug) {}
                    else return;

                    // If the `key` is "AddCardToHand", check if the previous history entry was `DrawCard`, and they both contained the exact same `val`.
                    // If so, ignore it.
                    if (key === "AddCardToHand" && i > 0) {
                        const lastEntry = history[t][i - 1];

                        if (lastEntry[0] == "DrawCard") {
                            if ((lastEntry[1] as Card).uuid == (val as Card).uuid) return;
                        }
                    }

                    const shouldHide = game.config.advanced.hideValueHistoryKeys.includes(key) && !flags?.debug;

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

                    const finishedKey = key[0].toUpperCase() + key.slice(1);

                    finished += `${finishedKey}: ${val}\n`;
                });
            });


            if (flags?.echo === false) {}
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

            const cardName = args.join(" ");

            const card = game.functions.card.getFromName(cardName);
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
                if (game.functions.util.lastChar(code) == ";") code = code.slice(0, -1);

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

            const eventCards: [Card, number][] = game.events.events.PlayCard[game.player.id];
            if (eventCards.length <= 0) {
                game.input("<red>No cards to undo.</red>\n");
                return false;
            }

            let card = game.lodash.last(eventCards)?.[0];
            if (!card) {
                game.input("<red>No cards found.</red>\n");
                return false;
            }

            // Remove the event so you can undo more than the last played card
            game.events.events.PlayCard[game.player.id].pop();

            // If the card can appear on the board, remove it.
            if (card.canBeOnBoard()) {
                game.functions.util.remove(game.board[game.player.id], card);

                // If the card has 0 or less health, restore it to its original health (according to the blueprint)
                if (card.type === "Minion" && card.getHealth() <= 0) {
                    if (!card.stats) throw new Error("Minion has no stats!");

                    card.stats[1] = card.storage.init.stats[1];
                }
                else if (card.type === "Location" && (card.durability ?? 0 <= 0)) {
                    if (!card.durability) throw new Error("Location has undefined durability!");
                    card.durability = card.storage.init.durability;
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
            game.functions.util.createLogFile();
        }
        else if (name === "/ai") {
            let finished = "";

            if (flags?.echo) finished += "AI Info:\n\n";

            for (let i = 0; i < 2; i++) {
                const plr = game.functions.util.getPlayerFromId(i);
                if (!plr.ai) continue;

                finished += `AI${i + 1} History: {\n`;

                plr.ai.history.forEach((obj: AIHistory, objIndex: number) => {
                    finished += `${objIndex + 1} ${obj.type}: (${obj.data}),\n`;
                });
                
                finished += "}\n";
            }

            if (flags?.echo === false) {}
            else {
                game.log(finished);

                game.input("\nPress enter to continue...");
            }

            return finished;
        }
        else if (name === "/cmd") {
            const history = Object.values(game.events.history).map(t => t.filter(
                (v) => v[0] == "Input" &&
                (v[1] as EventValue<"Input">).startsWith("/") &&
                v[2] == game.player &&
                !(v[1] as EventValue<"Input">).startsWith("/cmd")
            ));
            
            history.forEach((obj, i) => {
                if (obj.length <= 0) return;

                game.log(`\nTurn ${i}:`);

                obj.forEach((h, index) => {
                    /**
                     * The user's input
                     */
                    const input = h[1];

                    game.log(`[${index + 1}] ${input}`);
                });
            });

            const turnIndex = parseInt(game.input("\nWhich turn does the command belong to? (eg. 1): "));
            if (!turnIndex || turnIndex < 0 || !history[turnIndex]) {
                game.input("<red>Invalid turn.</red>\n");
                return false;
            }

            const commandIndex = parseInt(game.input("\nWhat is the index of the command in that turn? (eg. 1): "));
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

            game.interact.info.printAll(game.player);
            const options = parseInt(game.input(`\nWhat would you like to do with this command?\n${command}\n\n(1. Run it, 2. Edit it, 0. Cancel): `));
            if (!options) {
                game.input("<red>Invalid option.</red>\n");
                return false;
            }

            if (options === 0) return false;
            if (options === 1) {
                this.doTurnLogic(command);
            }
            if (options === 2) {
                const addition = game.input("Which card do you want to play? " + command);
                this.doTurnLogic(command + addition);
            }
        }
        else if (name === "/set") {
            if (args.length != 2) {
                game.input("<red>Invalid amount of arguments!</red>\n");
                return false;
            }

            const [key, value] = args;

            const name = Object.keys(game.config).find(k => k === value);
            if (!name) {
                game.input("<red>Invalid setting name!</red>\n");
                return false;
            }

            const setting: {[key: string]: any} = game.config[name as keyof GameConfig];

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

            let newValue

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
            if (game.config.advanced.reloadCommandConfirmation && !flags?.debug) {
                game.interact.info.printAll(game.player);
                const sure = game.interact.yesNoQuestion(game.player, "<yellow>Are you sure you want to reload? This will reset all cards to their base state. This can also cause memory leaks with excessive usage.\nThis requires the game to be recompiled. I recommend using `tsc --watch` in another window before running this command.</yellow>");
                if (!sure) return false;
            }

            let success = true;

            success &&= game.interact.info.withStatus("Registering cards", () => {
                reloadCards(game.functions.file.dirname() + "/dist/cards");
                return true;
            });

            // Go through all the cards and reload them
            success &&= game.interact.info.withStatus("Reloading cards", () => {
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

            if (!flags?.debug && success) game.input("\nThe cards have been reloaded.\nPress enter to continue...");
            if (!success) game.input("\nSome steps failed. The game could not be fully reloaded. Please report this.\nPress enter to continue...");
        }
        else if (name === "/freload" || name === "/frl") {
            return this.handleCmds("/reload", { debug: true });
        }
        else if (name === "/history") {
            return this.handleCmds("history", { debug: true });
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
        if (this.handleCmds(input) !== -1) return true;
        const parsedInput = parseInt(input);

        const card = game.player.hand[parsedInput - 1];
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
        game.events.tick("GameLoop", "doTurn", game.player);

        if (game.player.ai) {
            let input

            const rawInput = game.player.ai.calcMove();
            if (!rawInput) return false;
            if (rawInput instanceof Card) input = (game.player.hand.indexOf(rawInput) + 1).toString();
            else input = rawInput;

            game.events.broadcast("Input", input, game.player);
            const turn = this.doTurnLogic(input);

            game.killMinions();

            return turn;
        }

        game.interact.info.printAll(game.player);
    
        let input = "\nWhich card do you want to play? ";
        if (game.turns <= 2 && !game.config.general.debug) input += "(type 'help' for further information <- This will disappear once you end your turn) ";
    
        const user = game.input(input);
        const ret = this.doTurnLogic(user);
        game.killMinions();

        // If there were no errors, return true.
        if (ret === true) return ret;

        // Ignore these error codes
        if (["refund", "magnetize", "traded", "colossal"].includes(ret)) return ret;
        let err

        // Get the card
        const card = game.player.hand[parseInt(user) - 1];
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

    promptReplayOptions() {
        if (!game.running) return;

        // Stop replaying if the player doesn't have anything more in their input queue
        if (game.player.inputQueue === undefined) {
            game.replaying = false;
            return;
        }

        game.interact.info.printAll(game.player);

        let choice = game.input("\n(C)ontinue, (P)lay from here: ", false, false).toLowerCase()[0];

        switch (choice) {
            case "p":
                game.player1.inputQueue = undefined;
                game.player2.inputQueue = undefined;
                game.replaying = false;
                break;
            case "c":
            default:
                break;
        }
    }
}