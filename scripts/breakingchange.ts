/**
 * The breaking change script.
 * @module Breaking Change
 */

import process from 'node:process';
import rl from 'readline-sync';
import { createGame } from '../src/internal.js';

const { game } = createGame();

const MATCHING_CARDS: string[] = [];
let finishedCards: string[] = [];

let finishedCardsPath = 'patchedCards.txt';

function getFinishedCards(path: string) {
    // If the file doesn't exist, return.
    if (!game.functions.util.fs('exists', path)) {
        return;
    }

    const CARDS = game.functions.util.fs('read', path) as string;
    finishedCards = CARDS.split('\n');
}

function searchCards(query: RegExp | string) {
    game.functions.util.searchCardsFolder((fullPath, content) => {
        // The query is not a regular expression
        if (typeof query === 'string') {
            if (content.includes(query)) {
                MATCHING_CARDS.push(fullPath);
            }

            return;
        }

        // The query is a regex
        if (query.test(content)) {
            MATCHING_CARDS.push(fullPath);
        }
    });
}

function main() {
    game.interact.cls();
    const USE_REGEX = rl.keyInYN('Do you want to use regular expressions? (Don\'t do this unless you know what regex is, and how to use it)');
    let search: string | RegExp = game.input('Search: ');

    // Ignore case
    if (USE_REGEX) {
        search = new RegExp(search, 'i');
    }

    finishedCardsPath = `./${search}_${finishedCardsPath}`;
    // Remove any character that is not in /A-Za-z0-9_ /
    finishedCardsPath = finishedCardsPath.replaceAll(/[^\w ]/g, '_');

    getFinishedCards(finishedCardsPath);
    searchCards(search);

    // New line
    game.log();

    let running = true;
    while (running) {
        game.interact.cls();

        for (const [INDEX, CARD_NAME] of MATCHING_CARDS.entries()) {
            // `c` is the path to the card.
            game.log(`${INDEX + 1}: ${CARD_NAME}`);
        }

        const COMMAND = game.input('\nWhich card do you want to fix (type \'done\' to finish | type \'delete\' to delete the save file): ');
        if (COMMAND.toLowerCase().startsWith('done')) {
            running = false;
            break;
        }

        if (COMMAND.toLowerCase().startsWith('delete')) {
            game.log('Deleting file...');

            if (game.functions.util.fs('exists', finishedCardsPath)) {
                game.functions.util.fs('rm', finishedCardsPath);
                game.log('File deleted!');
            } else {
                game.log('File not found!');
            }

            game.pause();
            process.exit(0);
        }

        const INDEX = game.lodash.parseInt(COMMAND) - 1;
        if (!INDEX) {
            continue;
        }

        const PATH = MATCHING_CARDS[INDEX];
        if (!PATH) {
            game.log('Invalid index!');
            game.pause();

            continue;
        }

        // `card` is the path to that card.
        const SUCCESS = game.functions.util.runCommandAsChildProcess(`${game.config.general.editor} "${game.functions.util.dirname() + PATH}"`);
        // The `runCommandAsChildProcess` shows an error message for us, but we need to pause.
        if (!SUCCESS) {
            game.pause();
        }

        finishedCards.push(PATH);
        MATCHING_CARDS.splice(INDEX, 1);

        if (MATCHING_CARDS.length <= 0) {
            // All cards have been patched
            game.pause('All cards patched!\n');
            if (game.functions.util.fs('exists', finishedCardsPath)) {
                game.functions.util.fs('rm', finishedCardsPath);
            }

            // Exit so it doesn't save
            process.exit(0);
        }
    }

    // Save progress
    game.functions.util.fs('write', finishedCardsPath, finishedCards.join('\n'));
}

main();
