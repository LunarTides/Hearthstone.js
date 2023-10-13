import process from 'node:process';
import rl from 'readline-sync';
import {type Target, type EventValue, type GameConfig, type GamePlayCardReturn} from '@Game/types.js';
import {type Ai, Card, Player} from '../../internal.js';
import {reloadCards} from '../../helper/cards.js';

const licenseUrl = 'https://github.com/LunarTides/Hearthstone.js/blob/main/LICENSE';

// Override the console methods to force using the wrapper functions
// Set this variable to false to prevent disabling the console. (Not recommended)
const disableConsole = true;

const overrideConsole = {
    log(...data: any[]): void {
        throw new Error('Attempting to use override console before being given the `log` function.');
    },
    warn(...data: any[]): void {
        throw new Error('Attempting to use override console before being given the `warn` function.');
    },
    error(...data: any[]): void {
        throw new Error('Attempting to use override console before being given the `error` function.');
    },
};
overrideConsole.log = console.log;
overrideConsole.warn = console.warn;
overrideConsole.error = console.error;

if (disableConsole) {
    console.log = (..._) => {
        throw new Error('Use `game.log` instead.');
    };

    console.warn = (..._) => {
        throw new Error('Use `game.logWarn` instead.');
    };

    console.error = (..._) => {
        throw new Error('Use `game.logError` instead.');
    };
}

const getGame = () => game;

export const gameLoopInteract = {/**
     * Ask the user a question and returns their answer
     *
     * @param q The question to ask
     * @param care If this is false, it overrides `game.noInput`. Only use this when debugging.
     *
     * @returns What the user answered
     */
    input(q = '', care = true, useInputQueue = true): string {
        const wrapper = (a: string) => {
            if (game.player instanceof Player) {
                game.events.broadcast('Input', a, game.player);
            }

            if (game.replaying && useInputQueue) {
                this.promptReplayOptions();
            }

            return a;
        };

        if (game.noOutput) {
            q = '';
        }

        if (game.noInput && care) {
            return wrapper('');
        }

        q = game.functions.color.fromTags(q);

        // Let the game make choices for the user
        if (game.player.inputQueue && useInputQueue) {
            const queue = game.player.inputQueue;

            if (typeof (queue) === 'string') {
                return wrapper(queue);
            }

            // Invalid queue
            if (!(Array.isArray(queue))) {
                return wrapper(rl.question(q));
            }

            const answer = queue[0];
            queue.splice(0, 1);

            if (queue.length <= 0) {
                game.player.inputQueue = undefined;
            }

            return wrapper(answer);
        }

        return wrapper(rl.question(q));
    },

    /**
     * Helper function for the `game.log` functions. Don't use.
     */
    logWrapper(callback: (...data: any) => void, ...data: any) {
        if (game.noOutput) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        data = data.map((i: any) => typeof i === 'string' ? game.functions.color.fromTags(i) : i);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        callback(...data);
    },

    /**
     * Wrapper for console.log
     */
    log(...data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.logWrapper(overrideConsole.log, ...data);
    },

    /**
     * Wrapper for console.error
     */
    logError(...data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.logWrapper(overrideConsole.error, ...data);
    },

    /**
     * Wrapper for console.warn
     */
    logWarn(...data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.logWrapper(overrideConsole.warn, ...data);
    },

    /**
     * Asks the user to attack a minion or hero
     *
     * @returns Cancel | Success
     */
    // eslint-disable-next-line complexity
    doTurnAttack(): -1 | boolean | Card {
        let attacker;
        let target;

        if (game.player.ai) {
            const altModel = `legacyAttack${game.config.ai.attackModel}`;

            // Run the correct ai attack model
            const model = game.player.ai[altModel as keyof Ai];
            const ai = model ? (model as () => Array<-1 | Target>)() : game.player.ai.attack();

            attacker = ai[0];
            target = ai[1];

            if (attacker === -1 || target === -1) {
                return -1;
            }

            if (attacker === null || target === null) {
                return false;
            }
        } else {
            attacker = game.interact.selectTarget('Which minion do you want to attack with?', undefined, 'friendly', 'any');
            if (!attacker) {
                return false;
            }

            target = game.interact.selectTarget('Which minion do you want to attack?', undefined, 'enemy', 'any');
            if (!target) {
                return false;
            }
        }

        const errorcode = game.attack(attacker, target);
        game.killMinions();

        const ignore = ['divineshield'];
        if (errorcode === true || ignore.includes(errorcode)) {
            return true;
        }

        let error;

        switch (errorcode) {
            case 'taunt': {
                error = 'There is a minion with taunt in the way';
                break;
            }

            case 'stealth': {
                error = 'That minion has stealth';
                break;
            }

            case 'frozen': {
                error = 'That minion is frozen';
                break;
            }

            case 'plrnoattack': {
                error = 'You don\'t have any attack';
                break;
            }

            case 'noattack': {
                error = 'That minion has no attack';
                break;
            }

            case 'plrhasattacked': {
                error = 'Your hero has already attacked this turn';
                break;
            }

            case 'hasattacked': {
                error = 'That minion has already attacked this turn';
                break;
            }

            case 'sleepy': {
                error = 'That minion is exhausted';
                break;
            }

            case 'cantattackhero': {
                error = 'That minion cannot attack heroes';
                break;
            }

            case 'immune': {
                error = 'That minion is immune';
                break;
            }

            case 'dormant': {
                error = 'That minion is dormant';
                break;
            }

            default: {
                error = `An unknown error occurred. Error code: UnexpectedAttackingResult@${errorcode}`;
                break;
            }
        }

        game.log(`<red>${error}.</red>`);
        game.pause();
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
    // eslint-disable-next-line complexity
    handleCmds(q: string, flags?: {echo?: boolean; debug?: boolean}): boolean | string | -1 {
        const args = q.split(' ');
        const name = args.shift()?.toLowerCase();
        if (!name) {
            game.pause('<red>Invalid command.</red>\n');
            return false;
        }

        if (name === 'end') {
            game.endTurn();
        } else if (q === 'hero power') {
            if (game.player.ai) {
                game.player.heroPower();
                return true;
            }

            if (game.player.mana < game.player.heroPowerCost) {
                game.pause('<red>You do not have enough mana.</red>\n');
                return false;
            }

            if (!game.player.canUseHeroPower) {
                game.pause('<red>You have already used your hero power this turn.</red>\n');
                return false;
            }

            game.interact.info.printAll(game.player);
            const ask = game.interact.yesNoQuestion(game.player, `<yellow>${game.player.hero?.hpText}</yellow> Are you sure you want to use this hero power?`);
            if (!ask) {
                return false;
            }

            game.interact.info.printAll(game.player);
            game.player.heroPower();
        } else {
            switch (name) {
                case 'attack': {
                    this.doTurnAttack();
                    game.killMinions();

                    break;
                }

                case 'use': {
                    // Use location
                    const errorcode = game.interact.card.useLocation();
                    game.killMinions();

                    if (errorcode === true || errorcode === -1 || game.player.ai) {
                        return true;
                    }

                    let error;

                    switch (errorcode) {
                        case 'nolocations': {
                            error = 'You have no location cards';
                            break;
                        }

                        case 'invalidtype': {
                            error = 'That card is not a location card';
                            break;
                        }

                        case 'cooldown': {
                            error = 'That location is on cooldown';
                            break;
                        }

                        default: {
                            error = `An unknown error occourred. Error code: UnexpectedUseLocationResult@${errorcode}`;
                            break;
                        }
                    }

                    game.log(`<red>${error}.</red>`);
                    game.pause();

                    break;
                }

                case 'help': {
                    game.interact.info.printName();
                    game.log('(In order to run a command; input the name of the command and follow further instruction.)\n');
                    game.log('Available commands:');
                    game.log('(name)     - (description)\n');

                    game.log('end        - Ends your turn');
                    game.log('attack     - Attack');
                    game.log('hero power - Use your hero power');
                    game.log('history    - Displays a history of actions');
                    game.log('concede    - Forfeits the game');
                    game.log('view       - View a minion');
                    game.log('use        - Use a location card');
                    game.log('detail     - Get more details about opponent');
                    game.log('help       - Displays this message');
                    game.log('version    - Displays the version, branch, your settings preset, and some information about your current version.');
                    game.log('license    - Opens a link to this project\'s license');

                    const condColor = (string_: string) => (game.config.general.debug) ? string_ : `<gray>${string_}</gray>`;

                    game.log(condColor('\n--- Debug Commands (') + ((game.config.general.debug) ? '<bright:green>ON</bright:green>' : '<red>OFF</red>') + condColor(') ---'));
                    game.log(condColor('/give (name)        - Adds a card to your hand'));
                    game.log(condColor('/eval [log] (code)  - Runs the code specified. If the word \'log\' is before the code, instead game.log the code and wait for user input to continue.'));
                    game.log(condColor('/set (name) (value) - Changes a setting to (value). Look in the config files for a list of settings.'));
                    game.log(condColor('/debug              - Gives you infinite mana, health and armor'));
                    game.log(condColor('/exit               - Force exits the game. There will be no winner, and it will take you straight back to the runner.'));
                    game.log(condColor('/history            - Displays a history of actions. This doesn\'t hide any information, and is the same thing the log files uses.'));
                    game.log(condColor('/reload | /rl       - Reloads the cards and config in the game (Use \'/freload\' or \'/frl\' to ignore the confirmation prompt (or disable the prompt in the advanced config))'));
                    game.log(condColor('/undo               - Undoes the last card played. It gives the card back to your hand, and removes it from where it was. (This does not undo the actions of the card)'));
                    game.log(condColor('/cmd                - Shows you a list of debug commands you have run, and allows you to rerun them.'));
                    game.log(condColor('/ai                 - Gives you a list of the actions the ai(s) have taken in the order they took it'));
                    game.log(condColor('---------------------------' + ((game.config.general.debug) ? '' : '-')));

                    game.pause('\nPress enter to continue...\n');

                    break;
                }

                case 'view': {
                    const isHandAnswer = game.interact.question(game.player, 'Do you want to view a minion on the board, or in your hand?', ['Board', 'Hand']);
                    const isHand = isHandAnswer === 'Hand';

                    if (!isHand) {
                        // AllowLocations Makes selecting location cards allowed. This is disabled by default to prevent, for example, spells from killing the card.
                        const minion = game.interact.selectCardTarget('Which minion do you want to view?', undefined, 'any', ['allowLocations']);
                        if (!minion) {
                            return false;
                        }

                        game.interact.card.view(minion);

                        return true;
                    }

                    // View minion on the board
                    const cardId = game.input('\nWhich card do you want to view? ');
                    if (!cardId || !game.lodash.parseInt(cardId)) {
                        return false;
                    }

                    const card = game.player.hand[game.lodash.parseInt(cardId) - 1];

                    game.interact.card.view(card);

                    break;
                }

                case 'detail': {
                    game.player.detailedView = !game.player.detailedView;

                    break;
                }

                case 'concede': {
                    game.interact.info.printAll(game.player);
                    const confirmation = game.interact.yesNoQuestion(game.player, 'Are you sure you want to concede?');
                    if (!confirmation) {
                        return false;
                    }

                    game.endGame(game.player.getOpponent());

                    break;
                }

                case 'license': {
                    const start = (process.platform === 'darwin' ? 'open' : (process.platform === 'win32' ? 'start' : 'xdg-open'));
                    game.functions.util.runCommand(start + ' ' + licenseUrl);

                    break;
                }

                case 'version': {
                    const {version} = game.config.info;
                    const {branch} = game.config.info;
                    const {build} = game.config.info;

                    let running = true;
                    while (running) {
                        const todos = Object.entries(game.config.todo);

                        const printInfo = () => {
                            const game = getGame();
                            game.interact.info.printAll(game.player);

                            let strbuilder = `\nYou are on version: ${version}, on `;

                            switch (branch) {
                                case 'topic': {
                                    strbuilder += 'a topic branch';

                                    break;
                                }

                                case 'alpha': {
                                    strbuilder += 'the alpha branch';

                                    break;
                                }

                                case 'beta': {
                                    strbuilder += 'the beta branch';

                                    break;
                                }

                                case 'stable': {
                                    strbuilder += 'the stable (release) branch';

                                    break;
                                }
							// No default
                            }

                            strbuilder += `, on build ${build}`;
                            strbuilder += `, with latest commit hash '${game.functions.info.latestCommit()}',`;

                            if (game.config.general.debug && game.config.ai.player2) {
                                strbuilder += ' using the debug settings preset';
                            } else if (!game.config.general.debug && !game.config.ai.player2) {
                                strbuilder += ' using the recommended settings preset';
                            } else {
                                strbuilder += ' using custom settings';
                            }

                            game.log(strbuilder + '.\n');

                            game.log('Version Description:');

                            let introText;

                            switch (branch) {
                                case 'topic': {
                                    introText = game.config.info.topicIntroText;

                                    break;
                                }

                                case 'alpha': {
                                    introText = game.config.info.alphaIntroText;

                                    break;
                                }

                                case 'beta': {
                                    introText = game.config.info.betaIntroText;

                                    break;
                                }

                                case 'stable': {
                                    introText = game.config.info.stableIntroText;

                                    break;
                                }
							// No default
                            }

                            game.log(introText);
                            if (game.config.info.versionText) {
                                game.log(game.config.info.versionText);
                            }

                            game.log();

                            game.log('Todo List:');
                            if (todos.length <= 0) {
                                game.log('None.');
                            }
                        };

                        printInfo();

                        // Todo list
                        if (todos.length <= 0) {
                            game.pause('\nPress enter to continue...');
                            running = false;
                            break;
                        }

                        const printTodo = (todo: [string, {state: string; description: string}], id: number, printDesc = false) => {
                            const game = getGame();

                            const [name, info] = todo;
                            let [state, text] = Object.values(info);

                            switch (state) {
                                case 'done': {
                                    state = 'x';

                                    break;
                                }

                                case 'doing': {
                                    state = 'o';

                                    break;
                                }

                                case 'not done': {
                                    state = ' ';

                                    break;
                                }
							// No default
                            }

                            if (printDesc) {
                                game.log(`{${id}} [${state}] ${name}\n${text}`);
                            } else {
                                game.log(`{${id}} [${state}] ${name}`);
                            }
                        };

                        for (const [index, todo] of todos.entries()) {
                            printTodo(todo, index + 1);
                        }

                        const todoId = game.lodash.parseInt(game.input('\nType the id of a todo to see more information about it (eg. 1): '));
                        if (!todoId || todoId > todos.length || todoId <= 0) {
                            running = false;
                            break;
                        }

                        const todo = todos[todoId - 1];

                        printInfo();
                        printTodo(todo, todoId, true);

                        game.pause('\nPress enter to continue...');
                    }

                    break;
                }

                case 'history': {
                    if (flags?.echo === false) {
                        // Don't do anything
                    } else {
                        game.log('<yellow>Cards that are shown are collected while this screen is rendering. This means that it gets the information about the card from where it is when you ran this command, for example; the graveyard. This is why most cards have <1 health.</yellow>');
                    }

                    // History
                    const {history} = game.events;
                    let finished = '';

                    const showCard = (value: Card) => `${game.interact.card.getReadable(value)} which belongs to: <blue>${value.plr.name}</blue>, and has uuid: ${value.uuid.slice(0, 8)}`;

                    /**
					 * Transform the `value` into a readable string
					 *
					 * @param hide If it should hide the card
					 */
                    const doValue = (value: any, plr: Player, hide: boolean): any => {
                        if (value instanceof Card) {
                            // If the card is not hidden, or the card belongs to the current player, show it
                            if (!hide || value.plr === plr) {
                                return showCard(value);
                            }

                            // Hide the card
                            let revealed = false;

                            // It has has been revealed, show it.
                            for (const h of Object.values(history)) {
                                if (revealed) {
                                    continue;
                                }

                                for (const c of h) {
                                    if (revealed) {
                                        continue;
                                    }

                                    const [key, newValue, _] = c;

                                    // This shouldn't happen?
                                    if (!newValue) {
                                        continue;
                                    }

                                    if (game.config.advanced.whitelistedHistoryKeys.includes(key)) {
                                        // Do nothing
                                    } else {
                                        continue;
                                    }

                                    if (game.config.advanced.hideValueHistoryKeys.includes(key)) {
                                        continue;
                                    }

                                    // If it is not a card
                                    if (!(newValue instanceof Card)) {
                                        continue;
                                    }

                                    if (value.uuid !== newValue.uuid) {
                                        continue;
                                    }

                                    // The card has been revealed.
                                    revealed = true;
                                }
                            }

                            if (revealed) {
                                return 'Hidden > Revealed as: ' + showCard(value);
                            }

                            return 'Hidden';
                        }

                        if (value instanceof Player) {
                            return `Player ${value.id + 1}`;
                        }

                        // Return val as-is if it is not a card / player
                        return value;
                    };

                    for (const [t, h] of Object.values(history).entries()) {
                        let hasPrintedHeader = false;
                        let previousPlayer: Player | undefined;

                        for (const [i, c] of h.entries()) {
                            let [key, value, plr] = c;
                            if (!plr) {
                                // TODO: Maybe throw an error
                                continue;
                            }

                            if (plr !== previousPlayer) {
                                hasPrintedHeader = false;
                            }

                            previousPlayer = plr;

                            if (game.config.advanced.whitelistedHistoryKeys.includes(key) || flags?.debug) {
                                // Pass
                            } else {
                                continue;
                            }

                            // If the `key` is "AddCardToHand", check if the previous history entry was `DrawCard`, and they both contained the exact same `val`.
                            // If so, ignore it.
                            if (key === 'AddCardToHand' && i > 0) {
                                const lastEntry = history[t][i - 1];

                                if (lastEntry[0] === 'DrawCard' && (lastEntry[1] as Card).uuid === (value as Card).uuid) {
                                    continue;
                                }
                            }

                            const shouldHide = game.config.advanced.hideValueHistoryKeys.includes(key) && !flags?.debug;

                            if (!hasPrintedHeader) {
                                finished += `\nTurn ${t} - Player [${plr.name}]\n`;
                            }

                            hasPrintedHeader = true;

                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            value = doValue(value, game.player, shouldHide);

                            if (Array.isArray(value)) {
                                let strbuilder = '';

                                for (let v of value) {
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                    v = doValue(v, game.player, shouldHide);
                                    strbuilder += `${v?.toString()}, `;
                                }

                                strbuilder = strbuilder.slice(0, -2);
                                value = strbuilder;
                            }

                            const finishedKey = key[0].toUpperCase() + key.slice(1);

                            finished += `${finishedKey}: ${value?.toString()}\n`;
                        }
                    }

                    if (flags?.echo === false) {
                        // Do nothing
                    } else {
                        game.log(finished);

                        game.pause('\nPress enter to continue...');
                    }

                    return finished;
                }

                default: { if (name.startsWith('/') && !game.config.general.debug) {
                    game.pause('<red>You are not allowed to use this command.</red>');
                    return false;
                }

                switch (name) {
                    case '/give': {
                        if (args.length <= 0) {
                            game.pause('<red>Too few arguments.</red>\n');
                            return false;
                        }

                        const cardName = args.join(' ');

                        const card = game.functions.card.getFromName(cardName);
                        if (!card) {
                            game.pause(`<red>Invalid card: <yellow>${cardName}</yellow>.\n`);
                            return false;
                        }

                        game.player.addToHand(new Card(card.name, game.player));

                        break;
                    }

                    case '/eval': {
                        if (args.length <= 0) {
                            game.pause('<red>Too few arguments.</red>\n');
                            return -1;
                        }

                        let log = false;

                        if (args[0] === 'log') {
                            log = true;
                            args.shift();
                        }

                        let code = args.join(' ');

                        if (log) {
                            if (game.functions.util.lastChar(code) === ';') {
                                code = code.slice(0, -1);
                            }

                            code = `game.log(${code});game.pause();`;
                        }

                        game.evaling = true;
                        try {
                            // eslint-disable-next-line no-eval
                            eval(code);

                            game.events.broadcast('Eval', code, game.player);
                        } catch (error) {
                            game.log('\n<red>An error happened while running this code! Here is the error:</red>');
                            game.log(error.stack);
                            game.pause();
                        }

                        game.evaling = false;

                        break;
                    }

                    case '/debug': {
                        game.player.maxMana = 1000;
                        game.player.emptyMana = 1000;
                        game.player.mana = 1000;

                        game.player.health += 10_000;
                        game.player.armor += 100_000;
                        game.player.fatigue = 0;

                        break;
                    }

                    case '/undo': {
                        // Get the last played card
                        if (!game.events.events.PlayCard || game.events.events.PlayCard[game.player.id].length <= 0) {
                            game.pause('<red>No cards to undo.</red>\n');
                            return false;
                        }

                        const eventCards: Array<[Card, number]> = game.events.events.PlayCard[game.player.id];
                        if (eventCards.length <= 0) {
                            game.pause('<red>No cards to undo.</red>\n');
                            return false;
                        }

                        let card = game.lodash.last(eventCards)?.[0];
                        if (!card) {
                            game.pause('<red>No cards found.</red>\n');
                            return false;
                        }

                        // Remove the event so you can undo more than the last played card
                        game.events.events.PlayCard[game.player.id].pop();

                        // If the card can appear on the board, remove it.
                        if (card.canBeOnBoard()) {
                            game.functions.util.remove(game.board[game.player.id], card);

                            // If the card has 0 or less health, restore it to its original health (according to the blueprint)
                            if (card.type === 'Minion' && card.getHealth() <= 0) {
                                if (!card.stats) {
                                    throw new Error('Minion has no stats!');
                                }

                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                card.stats[1] = card.storage.init.stats[1];
                            } else if (card.type === 'Location' && card.durability! <= 0) {
                                if (!card.durability) {
                                    throw new Error('Location has undefined durability!');
                                }

                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                card.durability = card.storage.init.durability;
                            }
                        }

                        card = card.perfectCopy();

                        // If the card is a weapon, destroy it before adding it to the player's hand.
                        if (card.type === 'Weapon') {
                            game.player.destroyWeapon();
                        }

                        // If the card is a hero, reset the player's hero to the default one from their class.
                        if (card.type === 'Hero') {
                            game.player.setToStartingHero();
                        }

                        game.player.addToHand(card);
                        game.player.refreshMana(card.cost);

                        break;
                    }

                    case '/exit': {
                        game.running = false;
                        game.functions.util.createLogFile();

                        break;
                    }

                    case '/ai': {
                        let finished = '';

                        if (flags?.echo) {
                            finished += 'AI Info:\n\n';
                        }

                        for (let i = 0; i < 2; i++) {
                            const plr = game.functions.util.getPlayerFromId(i);
                            if (!plr.ai) {
                                continue;
                            }

                            finished += `AI${i + 1} History: {\n`;

                            for (const [objectIndex, object] of plr.ai.history.entries()) {
                                finished += `${objectIndex + 1} ${object.type}: (${object.data}),\n`;
                            }

                            finished += '}\n';
                        }

                        if (flags?.echo === false) {
                            // Do nothing
                        } else {
                            game.log(finished);

                            game.pause('\nPress enter to continue...');
                        }

                        return finished;
                    }

                    case '/cmd': {
                        const history = Object.values(game.events.history).map(t => t.filter(
                            v => v[0] === 'Input'
							&& (v[1] as EventValue<'Input'>).startsWith('/')
							&& v[2] === game.player
							&& !(v[1] as EventValue<'Input'>).startsWith('/cmd'),
                        ));

                        for (const [i, object] of history.entries()) {
                            if (object.length <= 0) {
                                continue;
                            }

                            game.log(`\nTurn ${i}:`);

                            for (const [index, h] of object.entries()) {
                                /**
                     * The user's input
                     */
                                const input = h[1];

                                game.log(`[${index + 1}] ${input?.toString()}`);
                            }
                        }

                        const turnIndex = game.lodash.parseInt(game.input('\nWhich turn does the command belong to? (eg. 1): '));
                        if (!turnIndex || turnIndex < 0 || !history[turnIndex]) {
                            game.pause('<red>Invalid turn.</red>\n');
                            return false;
                        }

                        const commandIndex = game.lodash.parseInt(game.input('\nWhat is the index of the command in that turn? (eg. 1): '));
                        if (!commandIndex || commandIndex < 1 || !history[turnIndex][commandIndex - 1]) {
                            game.pause('<red>Invalid command index.</red>\n');
                            return false;
                        }

                        let command = history[turnIndex][commandIndex - 1][1];
                        if (!command) {
                            game.pause('<red>Invalid command.</red>\n');
                            return false;
                        }

                        command = command as EventValue<'Input'>;

                        game.interact.info.printAll(game.player);
                        const options = game.lodash.parseInt(game.input(`\nWhat would you like to do with this command?\n${command}\n\n(1. Run it, 2. Edit it, 0. Cancel): `));
                        if (!options) {
                            game.pause('<red>Invalid option.</red>\n');
                            return false;
                        }

                        if (options === 0) {
                            return false;
                        }

                        if (options === 1) {
                            this.doTurnLogic(command);
                        }

                        if (options === 2) {
                            const addition = game.input('Which card do you want to play? ' + command);
                            this.doTurnLogic(command + addition);
                        }

                        break;
                    }

                    case '/set': {
                        if (args.length !== 2) {
                            game.pause('<red>Invalid amount of arguments!</red>\n');
                            return false;
                        }

                        const [key, value] = args;

                        const name = Object.keys(game.config).find(k => k === value);
                        if (!name) {
                            game.pause('<red>Invalid setting name!</red>\n');
                            return false;
                        }

                        const setting: Record<string, any> = game.config[name as keyof GameConfig];

                        if (setting === undefined) {
                            game.pause('<red>Invalid setting name!</red>\n');
                            return false;
                        }

                        if (!(/number|boolean|string/.test(typeof setting))) {
                            game.pause(`<red>You cannot change this setting, as it is a '${typeof setting}', and you can only change: number, boolean, string.</red>\n`);
                            return false;
                        }

                        if (key === 'debug') {
                            game.pause('<red>You can\'t change the debug setting, as that could lock you out of the set command.</red>\n');
                            return false;
                        }

                        let newValue;

                        if (['off', 'disable', 'false', 'no', '0'].includes(value)) {
                            game.log(`<bright:green>Setting '${key}' has been disabled.</bright:green>`);
                            newValue = false;
                        } else if (['on', 'enable', 'true', 'yes', '1'].includes(value)) {
                            game.log(`<bright:green>Setting '${key}' has been disabled.</bright:green>`);
                            newValue = true;
                        } else if (Number.parseFloat(value)) {
                            game.log(`<bright:green>Setting '${key}' has been set to the float: ${value}.</bright:green>`);
                            newValue = Number.parseFloat(value);
                        } else if (game.lodash.parseInt(value)) {
                            game.log(`<bright:green>Setting '${key}' has been set to the integer: ${value}.</bright:green>`);
                            newValue = game.lodash.parseInt(value);
                        } else {
                            game.log(`<bright:green>Setting '${key}' has been set to the string literal: ${value}.</bright:green>`);
                            newValue = value;
                        }

                        if (newValue === undefined) {
                            // This should never really happen
                            game.pause('<red>Invalid value!</red>\n');
                            return false;
                        }

                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        game.config[key as keyof GameConfig] = newValue as any;
                        game.doConfigAi();

                        game.pause();

                        break;
                    }

                    case '/reload':
                    case '/rl': {
                        if (game.config.advanced.reloadCommandConfirmation && !flags?.debug) {
                            game.interact.info.printAll(game.player);
                            const sure = game.interact.yesNoQuestion(game.player, '<yellow>Are you sure you want to reload? This will reset all cards to their base state. This can also cause memory leaks with excessive usage.\nThis requires the game to be recompiled. I recommend using `tsc --watch` in another window before running this command.</yellow>');
                            if (!sure) {
                                return false;
                            }
                        }

                        let success = true;

                        success &&= game.interact.info.withStatus('Registering cards', () => {
                            reloadCards(game.functions.file.dirname() + '/dist/cards');
                            return true;
                        });

                        // Go through all the cards and reload them
                        success &&= game.interact.info.withStatus('Reloading cards', () => {
                            /**
                 * Reloads a card
                 */
                            const reload = (card: Card) => {
                                card.doBlueprint();
                            };

                            for (const p of [game.player1, game.player2]) {
                                for (const c of p.hand) {
                                    reload(c);
                                }

                                for (const c of p.deck) {
                                    reload(c);
                                }
                            }

                            for (const p of game.board) {
                                for (const c of p) {
                                    reload(c);
                                }
                            }

                            for (const p of game.graveyard) {
                                for (const c of p) {
                                    reload(c);
                                }
                            }

                            return true;
                        });

                        if (!flags?.debug && success) {
                            game.pause('\nThe cards have been reloaded.\nPress enter to continue...');
                        }

                        if (!success) {
                            game.pause('\nSome steps failed. The game could not be fully reloaded. Please report this.\nPress enter to continue...');
                        }

                        break;
                    }

                    case '/freload':
                    case '/frl': {
                        return this.handleCmds('/reload', {debug: true});
                    }

                    case '/history': {
                        return this.handleCmds('history', {debug: true});
                    }

                    default: {return -1;}
                }
                }
            }
        }

        // True if a command was ran, and no errors were found
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
        if (this.handleCmds(input) !== -1) {
            return true;
        }

        const parsedInput = game.lodash.parseInt(input);

        const card = game.player.hand[parsedInput - 1];
        if (!card) {
            return 'invalid';
        }

        if (parsedInput === game.player.hand.length || parsedInput === 1) {
            card.activate('outcast');
        }

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
        game.events.tick('GameLoop', 'doTurn', game.player);

        if (game.player.ai) {
            const rawInput = game.player.ai.calcMove();
            if (!rawInput) {
                return false;
            }

            const input = rawInput instanceof Card ? (game.player.hand.indexOf(rawInput) + 1).toString() : rawInput;

            game.events.broadcast('Input', input, game.player);
            const turn = this.doTurnLogic(input);

            game.killMinions();

            return turn;
        }

        game.interact.info.printAll(game.player);

        let input = '\nWhich card do you want to play? ';
        if (game.turns <= 2 && !game.config.general.debug) {
            input += '(type \'help\' for further information <- This will disappear once you end your turn) ';
        }

        const user = game.input(input);
        const returnValue = this.doTurnLogic(user);
        game.killMinions();

        // If there were no errors, return true.
        if (returnValue === true) {
            return returnValue;
        }

        let error;

        // Get the card
        const card = game.player.hand[game.lodash.parseInt(user) - 1];
        let cost = 'mana';
        if (card) {
            cost = card.costType;
        }

        // Error Codes
        switch (returnValue) {
            case 'cost': {
                error = `Not enough ${cost}`;
                break;
            }

            case 'counter': {
                error = 'Your card has been countered';
                break;
            }

            case 'space': {
                error = `You can only have ${game.config.general.maxBoardSpace} minions on the board`;
                break;
            }

            case 'invalid': {
                error = 'Invalid card';
                break;
            }

            // Ignore these error codes
            case 'refund':
            case 'magnetize':
            case 'traded':
            case 'forged':
            case 'colossal': {
                return returnValue;
            }

            default: {
                error = `An unknown error occurred. Error code: UnexpectedDoTurnResult@${returnValue as string}`;
                break;
            }
        }

        game.pause(`<red>${error}.</red>\n`);

        return false;
    },

    promptReplayOptions() {
        if (!game.running) {
            return;
        }

        // Stop replaying if the player doesn't have anything more in their input queue
        if (game.player.inputQueue === undefined) {
            game.replaying = false;
            return;
        }

        game.interact.info.printAll(game.player);

        const choice = game.input('\n(C)ontinue, (P)lay from here: ', false, false).toLowerCase()[0];

        switch (choice) {
            case 'p': {
                game.player1.inputQueue = undefined;
                game.player2.inputQueue = undefined;
                game.replaying = false;
                break;
            }

            default: {
                break;
            }
        }
    },
};
