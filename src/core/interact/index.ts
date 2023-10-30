/**
 * Interact stuff.
 * @module Interact
 */
import process from 'node:process';
import { type Player, Card, CARD_INTERACT, GAMELOOP_INTERACT, INFO_INTERACT } from '../../internal.js';
import { type SelectTargetAlignment, type SelectTargetClass, type SelectTargetFlag, type Target } from '../../types.js';

export const INTERACT = {
    /**
     * Card related interactions.
     */
    card: CARD_INTERACT,

    /**
     * Information.
     */
    info: INFO_INTERACT,

    /**
     * Game loop related interactions.
     */
    gameLoop: GAMELOOP_INTERACT,

    // Deck stuff

    /**
     * Asks the player to supply a deck code.
     *
     * If no code was given, fill the players deck with 30 Sheep unless both;
     * - Debug mode is disabled
     * - The program is running on the stable branch
     *
     * @param plr The player to ask
     *
     * @returns Success
     */
    deckCode(plr: Player): boolean {
        game.interact.info.watermark();

        /**
         * If the test deck (30 Sheep) should be allowed
         */
        // I want to be able to test without debug mode on a non-stable branch
        const ALLOW_TEST_DECK: boolean = game.config.general.debug || game.config.info.branch !== 'stable';

        const DEBUG_STATEMENT = ALLOW_TEST_DECK ? ' <gray>(Leave this empty for a test deck)</gray>' : '';
        const DECKCODE = game.input(`Player ${plr.id + 1}, please type in your deckcode${DEBUG_STATEMENT}: `);

        let result = true;

        if (DECKCODE.length > 0) {
            result = Boolean(game.functions.deckcode.import(plr, DECKCODE));
        } else {
            if (!ALLOW_TEST_DECK) {
                // Give error message
                game.pause('<red>Please enter a deckcode!</red>\n');
                return false;
            }

            // Debug mode is enabled, use the 30 Sheep debug deck.
            while (plr.deck.length < 30) {
                plr.deck.push(new Card('Sheep', plr));
            }
        }

        return result;
    },

    // One-time things

    /**
     * Asks the player to choose an option.
     *
     * @param times The amount of times to ask
     * @param prompts [prompt, callback]
     */
    chooseOne(times: number, ...prompts: Array<[string, () => void]>): void {
        let chosen = 0;

        while (chosen < times) {
            game.interact.info.showGame(game.player);

            if (game.player.ai) {
                const AI_CHOICE = game.player.ai.chooseOne(prompts.map(p => p[0]));
                if (!AI_CHOICE) {
                    continue;
                }

                chosen++;

                // Call the callback function
                prompts[AI_CHOICE][1]();
                continue;
            }

            let p = `\nChoose ${times - chosen}:\n`;

            for (const [INDEX, PROMPT_OBJECT] of prompts.entries()) {
                p += `${INDEX + 1}: ${PROMPT_OBJECT[0]},\n`;
            }

            const CHOICE = game.lodash.parseInt(game.input(p)) - 1;
            if (Number.isNaN(CHOICE) || CHOICE < 0 || CHOICE >= prompts.length) {
                game.pause('<red>Invalid input!</red>\n');
                this.chooseOne(times, ...prompts);
                return;
            }

            chosen++;

            // Call the callback function
            prompts[CHOICE][1]();
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
        const retry = () => this.question(plr, prompt, answers);

        game.interact.info.showGame(plr);

        let strbuilder = `\n${prompt} [`;

        for (const [INDEX, ANSWER] of answers.entries()) {
            strbuilder += `${INDEX + 1}: ${ANSWER}, `;
        }

        strbuilder = strbuilder.slice(0, -2);
        strbuilder += '] ';

        let choice: number;

        if (plr.ai) {
            const AI_CHOICE = plr.ai.question(prompt, answers);
            if (!AI_CHOICE) {
                // Code, expected, actual
                throw new Error(`AI Error: expected: ${AI_CHOICE}, got: some number. Error Code: AiQuestionReturnInvalidAtQuestionFunction`);
            }

            choice = AI_CHOICE;
        } else {
            choice = game.lodash.parseInt(game.input(strbuilder));
        }

        const ANSWER = answers[choice - 1];
        if (!ANSWER) {
            game.pause('<red>Invalid input!</red>\n');
            retry();
        }

        return ANSWER;
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
        const ASK = `\n${prompt} [<bright:green>Y</bright:green> | <red>N</red>] `;

        if (plr.ai) {
            return plr.ai.yesNoQuestion(prompt);
        }

        const RAW_CHOICE = game.input(ASK);
        const CHOICE = RAW_CHOICE.toUpperCase()[0];

        if (['Y', 'N'].includes(CHOICE)) {
            return CHOICE === 'Y';
        }

        // Invalid input
        game.log(`<red>Unexpected input: '<yellow>${RAW_CHOICE}</yellow>'. Valid inputs: </red>[<bright:green>Y</bright:green> | <red>N</red>]`);
        game.pause();

        return this.yesNoQuestion(plr, prompt);
    },

    /**
     * Like `selectTarget` but restricts the user to selecting heroes.
     *
     * The advantage of this function is that it returns `Player | false` instead of `Target | false`.
     */
    selectPlayerTarget(prompt: string, card: Card | undefined, flags: SelectTargetFlag[] = []): Player | false {
        return this.selectTarget(prompt, card, 'any', 'hero', flags) as Player | false;
    },

    /**
     * Like `selectTarget` but restricts the user to selecting minions.
     *
     * The advantage of this function is that it returns `Card | false` instead of `Target | false`.
     */
    selectCardTarget(prompt: string, card: Card | undefined, side: SelectTargetAlignment, flags: SelectTargetFlag[] = []): Card | false {
        return this.selectTarget(prompt, card, side, 'minion', flags) as Card | false;
    },

    /**
     * #### You might want to use `selectPlayerTarget` or `selectCardTarget` instead.
     *
     * Asks the user a `prompt`, the user can then select a minion or hero.
     * Broadcasts the `TargetSelectionStarts` and the `TargetSelected` event. Can broadcast the `CastSpellOnMinion` event.
     *
     * @param prompt The prompt to ask
     * @param card The card that called this function.
     * @param forceSide Force the user to only be able to select minions / the hero of a specific side
     * @param forceClass Force the user to only be able to select a minion or a hero
     * @param flags Change small behaviours ["allowLocations" => Allow selecting location, ]
     *
     * @returns The card or hero chosen
     */
    selectTarget(prompt: string, card: Card | undefined, forceSide: SelectTargetAlignment, forceClass: SelectTargetClass, flags: SelectTargetFlag[] = []): Target | false {
        game.events.broadcast('TargetSelectionStarts', [prompt, card, forceSide, forceClass, flags], game.player);
        const TARGET = this._selectTarget(prompt, card, forceSide, forceClass, flags);

        if (TARGET) {
            game.events.broadcast('TargetSelected', [card, TARGET], game.player);
        }

        return TARGET;
    },

    // eslint-disable-next-line complexity
    _selectTarget(prompt: string, card: Card | undefined, forceSide: SelectTargetAlignment, forceClass: SelectTargetClass, flags: SelectTargetFlag[] = []): Target | false {
        // If the player is forced to select a target, select that target.
        if (game.player.forceTarget) {
            return game.player.forceTarget;
        }

        // If the player is an ai, hand over control to the ai.
        if (game.player.ai) {
            return game.player.ai.selectTarget(prompt, card, forceSide, forceClass, flags);
        }

        // If the player is forced to select a hero
        if (forceClass === 'hero') {
            const TARGET = game.input('Do you want to select the enemy hero, or your own hero? (y: enemy, n: friendly) ');

            return (TARGET.startsWith('y')) ? game.opponent : game.player;
        }

        // From this point, forceClass is either
        // 1. any
        // 2. minion

        // Ask the player to choose a target.
        let p = `\n${prompt} (`;
        if (forceClass === 'any') {
            p += 'type \'face\' to select a hero | ';
        }

        p += 'type \'back\' to go back) ';

        const TARGET = game.input(p);

        // Player chose to go back
        if (TARGET.startsWith('b') || this.shouldExit(TARGET)) {
            // This should always be safe.
            return false;
        }

        // Get a list of each side of the board
        const BOARD_OPPONENT = game.board[game.opponent.id];
        const BOARD_FRIENDLY = game.board[game.player.id];

        // Get each minion that matches the target.
        const BOARD_OPPONENT_TARGET = BOARD_OPPONENT[game.lodash.parseInt(TARGET) - 1];
        const BOARD_FRIENDLY_TARGET = BOARD_FRIENDLY[game.lodash.parseInt(TARGET) - 1];

        /**
         * This is the resulting minion that the player chose, if any.
         */
        let minion: Card;

        // If the player didn't choose to attack a hero, and no minions could be found at the index requested, try again.
        if (!TARGET.startsWith('face') && !BOARD_FRIENDLY_TARGET && !BOARD_OPPONENT_TARGET) {
            // Target !== "face" and target is not a minion.
            // The input is invalid
            game.pause('<red>Invalid input / minion!</red>\n');

            return this._selectTarget(prompt, card, forceSide, forceClass, flags);
        }

        // If the player is forced to one side.
        if (forceSide === 'any') {
            // If the player chose to target a hero, it will ask which hero.
            if (TARGET.startsWith('face') && forceClass !== 'minion') {
                return this._selectTarget(prompt, card, forceSide, 'hero', flags);
            }

            // If both players have a minion with the same index,
            // ask them which minion to select
            if (BOARD_OPPONENT.length >= game.lodash.parseInt(TARGET) && BOARD_FRIENDLY.length >= game.lodash.parseInt(TARGET)) {
                const OPPONENT_TARGET_NAME = BOARD_OPPONENT_TARGET.colorFromRarity();
                const FRIENDLY_TARGET_NAME = BOARD_FRIENDLY_TARGET.colorFromRarity();

                const ALIGNMENT = game.input(`Do you want to select your opponent's (${OPPONENT_TARGET_NAME}) or your own (${FRIENDLY_TARGET_NAME})? (y: opponent, n: friendly | type 'back' to go back) `);

                if (ALIGNMENT.startsWith('b') || this.shouldExit(ALIGNMENT)) {
                    // Go back.
                    return this._selectTarget(prompt, card, forceSide, forceClass, flags);
                }

                minion = (ALIGNMENT.startsWith('y')) ? BOARD_OPPONENT_TARGET : BOARD_FRIENDLY_TARGET;
            } else {
                minion = BOARD_OPPONENT.length >= game.lodash.parseInt(TARGET) ? BOARD_OPPONENT_TARGET : BOARD_FRIENDLY_TARGET;
            }
        } else {
            // If the player chose a hero, and they are allowed to
            if (TARGET.startsWith('face') && forceClass !== 'minion') {
                if (forceSide === 'enemy') {
                    return game.opponent;
                }

                return game.player;
            }

            // Select the minion on the correct side of the board.
            minion = (forceSide === 'enemy') ? BOARD_OPPONENT_TARGET : BOARD_FRIENDLY_TARGET;
        }

        // If you didn't select a valid minion, return.
        if (minion === undefined) {
            game.pause('<red>Invalid minion.</red>\n');
            return false;
        }

        // If the minion has elusive, and the card that called this function is a spell
        if ((card && card.type === 'Spell') ?? flags.includes('forceElusive')) {
            if (minion.hasKeyword('Elusive')) {
                game.pause('<red>Can\'t be targeted by Spells or Hero Powers.</red>\n');

                return false;
            }

            game.events.broadcast('CastSpellOnMinion', [card, minion], game.player);
        }

        // If the minion has stealth, don't allow the opponent to target it.
        if (minion.hasKeyword('Stealth') && game.player !== minion.plr) {
            game.pause('<red>This minion has stealth.</red>\n');

            return false;
        }

        // If the minion is a location, don't allow it to be selectted unless the `allowLocations` flag was set.
        if (minion.type === 'Location' && !flags.includes('allowLocations')) {
            game.pause('<red>You cannot target location cards.</red>\n');

            return false;
        }

        return minion;
    },

    /**
     * Returns if the input is a command to exit / go back.
     */
    shouldExit(input: string): boolean {
        return ['exit', 'stop', 'quit', 'back', 'close'].includes(input.toLowerCase());
    },

    /**
     * Verifies that the diy card has been solved.
     *
     * @param condition The condition where, if true, congratulates the user
     * @param card The DIY card itself
     *
     * @returns Success
     */
    verifyDiySolution(condition: boolean, card: Card): boolean {
        if (card.plr.ai) {
            return false;
        }

        let success = false;

        if (condition) {
            game.log('Success! You did it, well done!');
            success = true;
        } else {
            const MATCH = /DIY (\d+)/.exec(card.name);
            const FILE_NAME = MATCH ? MATCH[1] : 'unknown';

            game.log(`Hm. This card doesn't seem to do what it's supposed to do... Maybe you should try to fix it? The card is in: './cards/Examples/DIY/${FILE_NAME}.ts'.`);
        }

        game.pause();
        return success;
    },

    /**
     * Clears the screen.
     */
    cls() {
        cls();
    },
};

function cls() {
    if (game && game.noOutput) {
        return;
    }

    console.clear();
    process.stdout.write('\u001Bc');
}
