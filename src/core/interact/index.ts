/**
 * Interact stuff.
 * @module Interact
 */
import { Card, CardInteract, GameLoopInteract, InfoInteract, Player } from '../../internal.js';
import { SelectTargetAlignment, SelectTargetClass, SelectTargetFlag, Target } from '../../types.js';

export const interact = {
    card: CardInteract,
    info: InfoInteract,
    gameLoop: GameLoopInteract,

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
        game.interact.info.printName();
    
        /**
         * If the test deck (30 Sheep) should be allowed
         */
        // I want to be able to test without debug mode on a non-stable branch
        const allowTestDeck: boolean = game.config.general.debug || game.config.info.branch !== "stable";

        const debugStatement = allowTestDeck ? " <gray>(Leave this empty for a test deck)</gray>" : "";
        const deckcode = game.input(`Player ${plr.id + 1}, please type in your deckcode${debugStatement}: `);

        let result: boolean | Card[] | null = true;

        if (deckcode.length > 0) result = game.functions.deckcode.import(plr, deckcode);
        else {
            if (!allowTestDeck) {
                // Give error message
                game.pause("<red>Please enter a deckcode!</red>\n");
                return false;
            }

            // Debug mode is enabled, use the 30 Sheep debug deck.
            while (plr.deck.length < 30) plr.deck.push(new Card("Sheep", plr));
        }

        if (result === null) return false;

        return true;
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
        game.interact.info.printAll(game.player);

        const choices = [];

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

            const choice = game.input(p);
            if (!parseInt(choice)) {
                game.pause("<red>Invalid input!</red>\n");
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
        const RETRY = () => {
            return this.question(plr, prompt, answers);
        }

        game.interact.info.printAll(plr);

        let strbuilder = `\n${prompt} [`;

        answers.forEach((v, i) => {
            strbuilder += `${i + 1}: ${v}, `;
        });

        strbuilder = strbuilder.slice(0, -2);
        strbuilder += "] ";

        let choice: number;

        if (plr.ai) {
            const aiChoice = plr.ai.question(prompt, answers);
            if (!aiChoice) {
                // code, expected, actual
                throw game.functions.util.AIError("AiQuestionReturnInvalidAtQuestionFunction", "some number", aiChoice);
            }

            choice = aiChoice;
        }
        else choice = parseInt(game.input(strbuilder));

        const answer = answers[choice - 1];
        if (!answer) {
            game.pause("<red>Invalid input!</red>\n");
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
        const ask = `\n${prompt} [<bright:green>Y</bright:green> | <red>N</red>] `;

        if (plr.ai) return plr.ai.yesNoQuestion(prompt);

        const _choice = game.input(ask);
        const choice = _choice.toUpperCase()[0];

        if (["Y", "N"].includes(choice)) return choice === "Y";

        // Invalid input
        game.log(`<red>Unexpected input: '<yellow>${_choice}</yellow>'. Valid inputs: </red>[<bright:green>Y</bright:green> | <red>N</red>]`);
        game.pause();

        return this.yesNoQuestion(plr, prompt);
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
     * @param forceSide Force the user to only be able to select minions / the hero of a specific side
     * @param forceClass Force the user to only be able to select a minion or a hero
     * @param flags Change small behaviours ["allowLocations" => Allow selecting location, ]
     * 
     * @returns The card or hero chosen
     */
    selectTarget(prompt: string, card: Card | null, forceSide: SelectTargetAlignment, forceClass: SelectTargetClass, flags: SelectTargetFlag[] = []): Target | false {
        game.events.broadcast("TargetSelectionStarts", [prompt, card, forceSide, forceClass, flags], game.player);
        const target = this._selectTarget(prompt, card, forceSide, forceClass, flags);

        if (target) game.events.broadcast("TargetSelected", [card, target], game.player);
        return target;
    },

    _selectTarget(prompt: string, card: Card | null, forceSide: SelectTargetAlignment, forceClass: SelectTargetClass, flags: SelectTargetFlag[] = []): Target | false {
        // If the player is forced to select a target, select that target.
        if (game.player.forceTarget) return game.player.forceTarget;

        // If the player is an ai, hand over control to the ai.
        if (game.player.ai) return game.player.ai.selectTarget(prompt, card, forceSide, forceClass, flags);

        // If the player is forced to select a hero
        if (forceClass == "hero") {
            const target = game.input(`Do you want to select the enemy hero, or your own hero? (y: enemy, n: friendly) `);
    
            return (target.startsWith("y")) ? game.opponent : game.player;
        }

        // From this point, forceClass is either
        // 1. any 
        // 2. minion

        // Ask the player to choose a target.
        let p = `\n${prompt} (`;
        if (forceClass === "any") p += "type 'face' to select a hero | ";
        p += "type 'back' to go back) ";

        const target = game.input(p);

        // Player chose to go back
        if (target.startsWith("b") || this.shouldExit(target)) {
            // This should always be safe.
            return false;
        }

        // Get a list of each side of the board
        const boardOpponent = game.board[game.opponent.id];
        const boardFriendly = game.board[game.player.id];

        // Get each minion that matches the target.
        const boardOpponentTarget = boardOpponent[parseInt(target) - 1];
        const boardFriendlyTarget = boardFriendly[parseInt(target) - 1];

        /**
         * This is the resulting minion that the player chose, if any.
         */
        let minion: Card;

        // If the player didn't choose to attack a hero, and no minions could be found at the index requested, try again.
        if (!target.startsWith("face") && !boardFriendlyTarget && !boardOpponentTarget) {
            // target != "face" and target is not a minion.
            // The input is invalid
            game.pause("<red>Invalid input / minion!</red>\n");

            return this._selectTarget(prompt, card, forceSide, forceClass, flags);
        }

        // If the player is forced to one side.
        if (forceSide === "any") {
            // If the player chose to target a hero, it will ask which hero.
            if (target.startsWith("face") && forceClass != "minion") return this._selectTarget(prompt, card, forceSide, "hero", flags);
            
            // If both players have a minion with the same index,
            // ask them which minion to select
            if (boardOpponent.length >= parseInt(target) && boardFriendly.length >= parseInt(target)) {
                const oName = game.functions.color.fromRarity(boardOpponentTarget.displayName, boardOpponentTarget.rarity);
                const fName = game.functions.color.fromRarity(boardFriendlyTarget.displayName, boardFriendlyTarget.rarity);

                const alignment = game.input(`Do you want to select your opponent's (${oName}) or your own (${fName})? (y: opponent, n: friendly | type 'back' to go back) `);
            
                if (alignment.startsWith("b") || this.shouldExit(alignment)) {
                    // Go back.
                    return this._selectTarget(prompt, card, forceSide, forceClass, flags);
                }

                minion = (alignment.startsWith("y")) ? boardOpponentTarget : boardFriendlyTarget;
            } else {
                minion = boardOpponent.length >= parseInt(target) ? boardOpponentTarget : boardFriendlyTarget;
            }
        }
        else {
            // If the player chose a hero, and they are allowed to
            if (target.startsWith("face") && forceClass != "minion") {
                if (forceSide == "enemy") return game.opponent;

                return game.player;
            }

            // Select the minion on the correct side of the board.
            minion = (forceSide == "enemy") ? boardOpponentTarget : boardFriendlyTarget;
        }

        // If you didn't select a valid minion, return.
        if (minion === undefined) {
            game.pause("<red>Invalid minion.</red>\n");
            return false;
        }

        // If the minion has elusive, and the card that called this function is a spell
        if ((card && card.type === "Spell") || flags.includes("forceElusive")) {
            if (minion.keywords.includes("Elusive")) {
                game.pause("<red>Can't be targeted by Spells or Hero Powers.</red>\n");
            
                return false;
            }

            game.events.broadcast("CastSpellOnMinion", [card, minion], game.player);
        }

        // If the minion has stealth, don't allow the opponent to target it.
        if (minion.keywords.includes("Stealth") && game.player != minion.plr) {
            game.pause("<red>This minion has stealth.</red>\n");

            return false;
        }

        // If the minion is a location, don't allow it to be selectted unless the `allowLocations` flag was set.
        if (minion.type == "Location" && !flags.includes("allowLocations")) {
            game.pause("<red>You cannot target location cards.</red>\n");

            return false;
        }

        return minion;
    },

    /**
     * Returns if the input is a command to exit / go back.
     */
    shouldExit(input: string): boolean {
        return ["exit", "stop", "quit", "back", "close"].includes(input.toLowerCase());
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
        
        game.pause();
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
    if (game && game.noOutput) return;

    console.clear();
    process.stdout.write('\x1bc');
}
