import rl from 'readline-sync';
import { type Target, type GamePlayCardReturn } from '@Game/types.js';
import { type Ai, Card, COMMANDS, DEBUG_COMMANDS } from '../../internal.js';

// Override the console methods to force using the wrapper functions
// Set this variable to false to prevent disabling the console. (Not recommended)
const DISABLE_CONSOLE = true;

const OVERRIDE_CONSOLE = {
    log(..._data: any[]): void {
        throw new Error('Attempting to use override console before being given the `log` function.');
    },
    warn(..._data: any[]): void {
        throw new Error('Attempting to use override console before being given the `warn` function.');
    },
    error(..._data: any[]): void {
        throw new Error('Attempting to use override console before being given the `error` function.');
    },
};
OVERRIDE_CONSOLE.log = console.log;
OVERRIDE_CONSOLE.warn = console.warn;
OVERRIDE_CONSOLE.error = console.error;

if (DISABLE_CONSOLE) {
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

export const GAMELOOP_INTERACT = { /**
     * Ask the user a question and returns their answer
     *
     * @param q The question to ask
     * @param overrideNoInput If this is true, it overrides `game.noInput`. Only use this when debugging.
     * @param useInputQueue If it should use the player's input queue
     *
     * @returns What the user answered
     */
    input(q = '', overrideNoInput = false, useInputQueue = true): string {
        const wrapper = (a: string) => {
            game.events.broadcast('Input', a, game.player);

            return a;
        };

        if (game.noOutput) {
            q = '';
        }

        if (game.noInput && !overrideNoInput) {
            return wrapper('');
        }

        q = game.functions.color.fromTags(q);

        // Let the game make choices for the user
        if (game.player.inputQueue && useInputQueue) {
            const QUEUE = game.player.inputQueue;

            if (typeof (QUEUE) === 'string') {
                return wrapper(QUEUE);
            }

            // Invalid queue
            if (!(Array.isArray(QUEUE))) {
                return wrapper(rl.question(q));
            }

            const ANSWER = QUEUE[0];
            QUEUE.splice(0, 1);

            if (QUEUE.length <= 0) {
                game.player.inputQueue = undefined;
            }

            return wrapper(ANSWER);
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
        this.logWrapper(OVERRIDE_CONSOLE.log, ...data);
    },

    /**
     * Wrapper for console.error
     */
    logError(...data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.logWrapper(OVERRIDE_CONSOLE.error, ...data);
    },

    /**
     * Wrapper for console.warn
     */
    logWarn(...data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.logWrapper(OVERRIDE_CONSOLE.warn, ...data);
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
            const ALTERNATIVE_MODEL = `legacyAttack${game.config.ai.attackModel}`;

            // Run the correct ai attack model
            const MODEL = game.player.ai[ALTERNATIVE_MODEL as keyof Ai];
            const AI_SELECTIONS = MODEL ? (MODEL as () => Array<-1 | Target>)() : game.player.ai.attack();

            attacker = AI_SELECTIONS[0];
            target = AI_SELECTIONS[1];

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

        const ERROR_CODE = game.attack(attacker, target);
        game.killMinions();

        const IGNORE = ['divineshield'];
        if (ERROR_CODE === true || IGNORE.includes(ERROR_CODE)) {
            return true;
        }

        let error;

        switch (ERROR_CODE) {
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
                error = `An unknown error occurred. Error code: UnexpectedAttackingResult@${ERROR_CODE}`;
                break;
            }
        }

        game.log(`<red>${error}.</red>`);
        game.pause();
        return false;
    },

    /**
     * Tries to run `cmd` as a command. If it fails, return -1
     *
     * @param cmd The command
     * @param flags Some flags to pass to the commands
     *
     * @returns A string if "echo" is false
     */
    handleCmds(cmd: string, flags?: { echo?: boolean; debug?: boolean }): boolean | string | -1 {
        const ARGS = cmd.split(' ');
        const NAME = ARGS.shift()?.toLowerCase();
        if (!NAME) {
            game.pause('<red>Invalid command.</red>\n');
            return false;
        }

        const getReturn = (result: any) => {
            if (typeof result === 'string' || result === -1) {
                return result as string | -1;
            }

            return true;
        };

        const COMMAND_NAME = Object.keys(COMMANDS).find(cmd => cmd.startsWith(NAME));
        if (COMMAND_NAME) {
            const command = COMMANDS[COMMAND_NAME];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const RESULT = command(ARGS, flags);
            return getReturn(RESULT);
        }

        if (!NAME.startsWith(game.config.advanced.debugCommandPrefix)) {
            return -1;
        }

        const DEBUG_NAME = NAME.slice(1);

        const DEBUG_COMMAND_NAME = Object.keys(DEBUG_COMMANDS).find(cmd => cmd.startsWith(DEBUG_NAME));
        if (DEBUG_COMMAND_NAME) {
            if (!game.config.general.debug) {
                game.pause('<red>You are not allowed to use this command.</red>');
                return false;
            }

            const command = DEBUG_COMMANDS[DEBUG_COMMAND_NAME];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const RESULT = command(ARGS, flags);
            return getReturn(RESULT);
        }

        return -1;
    },

    /**
     * Tries to handle `input` as a command. If it fails, try to play the card with the index of `input`.
     *
     * @param input The user input
     *
     * @returns The return value of `game.playCard`
     */
    doTurnLogic(input: string): GamePlayCardReturn {
        if (this.handleCmds(input) !== -1) {
            return true;
        }

        const PARSED_INPUT = game.lodash.parseInt(input);

        const CARD = game.player.hand[PARSED_INPUT - 1];
        if (!CARD) {
            return 'invalid';
        }

        if (PARSED_INPUT === game.player.hand.length || PARSED_INPUT === 1) {
            CARD.activate('outcast');
        }

        return game.playCard(CARD, game.player);
    },

    /**
     * Show the game state and asks the user for an input which is put into `doTurnLogic`.
     *
     * This is the core of the game loop.
     *
     * @returns Success | Ignored error code | The return value of doTurnLogic
     */
    doTurn(): boolean | string | GamePlayCardReturn {
        game.events.tick('GameLoop', 'doTurn', game.player);

        if (game.player.ai) {
            const RAW_INPUT = game.player.ai.calcMove();
            if (!RAW_INPUT) {
                return false;
            }

            const INPUT = RAW_INPUT instanceof Card ? (game.player.hand.indexOf(RAW_INPUT) + 1).toString() : RAW_INPUT;

            game.events.broadcast('Input', INPUT, game.player);
            const TURN = this.doTurnLogic(INPUT);

            game.killMinions();

            return TURN;
        }

        game.interact.info.showGame(game.player);
        game.log();

        let input = 'Which card do you want to play? ';
        if (game.turns <= 2 && !game.config.general.debug) {
            input += '(type \'help\' for further information <- This will disappear once you end your turn) ';
        }

        const USER = game.input(input);
        const RETURN_VALUE = this.doTurnLogic(USER);
        game.killMinions();

        // If there were no errors, return true.
        if (RETURN_VALUE === true) {
            return RETURN_VALUE;
        }

        let error;

        // Get the card
        const CARD = game.player.hand[game.lodash.parseInt(USER) - 1];
        let cost = 'mana';
        if (CARD) {
            cost = CARD.costType;
        }

        // Error Codes
        switch (RETURN_VALUE) {
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
                return RETURN_VALUE;
            }

            default: {
                error = `An unknown error occurred. Error code: UnexpectedDoTurnResult@${RETURN_VALUE as string}`;
                break;
            }
        }

        game.pause(`<red>${error}.</red>\n`);

        return false;
    },
};
