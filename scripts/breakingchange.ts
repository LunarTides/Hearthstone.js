/**
 * The breaking change script.
 * @module Breaking Change
 */

import process from 'node:process';
import rl from 'readline-sync';
import { createGame } from '../src/internal.js';

const { game } = createGame();

const matchingCards: string[] = [];
let finishedCards: string[] = [];

let finishedCardsPath = 'patchedCards.txt';

function getFinishedCards(path: string): void {
    // If the file doesn't exist, return.
    if (!game.functions.util.fs('exists', path)) {
        return;
    }

    const cards = game.functions.util.fs('read', path) as string;
    finishedCards = cards.split('\n');
}

function searchCards(query: RegExp | string): void {
    game.functions.util.searchCardsFolder((fullPath, content) => {
        // The query is not a regular expression
        if (typeof query === 'string') {
            if (content.includes(query)) {
                matchingCards.push(fullPath);
            }

            return;
        }

        // The query is a regex
        if (query.test(content)) {
            matchingCards.push(fullPath);
        }
    });
}

function main(): void {
    game.interact.cls();
    const useRegex = rl.keyInYN('Do you want to use regular expressions? (Don\'t do this unless you know what regex is, and how to use it)');
    let search: string | RegExp = game.input('Search: ');

    // Ignore case
    if (useRegex) {
        search = new RegExp(search, 'i');
    }

    finishedCardsPath = `./${search}_${finishedCardsPath}`;
    // Remove any character that is not in /A-Za-z0-9_ /
    finishedCardsPath = finishedCardsPath.replaceAll(/[^\w ]/g, '_');

    getFinishedCards(finishedCardsPath);
    searchCards(search);

    // New line
    console.log();

    let running = true;
    while (running) {
        game.interact.cls();

        for (const [index, cardName] of matchingCards.entries()) {
            // `c` is the path to the card.
            console.log(`${index + 1}: ${cardName}`);
        }

        const command = game.input('\nWhich card do you want to fix (type \'done\' to finish | type \'delete\' to delete the save file): ');
        if (command.toLowerCase().startsWith('done')) {
            running = false;
            break;
        }

        if (command.toLowerCase().startsWith('delete')) {
            console.log('Deleting file...');

            if (game.functions.util.fs('exists', finishedCardsPath)) {
                game.functions.util.fs('rm', finishedCardsPath);
                console.log('File deleted!');
            } else {
                console.log('File not found!');
            }

            game.pause();
            process.exit(0);
        }

        const index = game.lodash.parseInt(command) - 1;
        if (!index) {
            continue;
        }

        const path = matchingCards[index];
        if (!path) {
            console.log('Invalid index!');
            game.pause();

            continue;
        }

        // `card` is the path to that card.
        const success = game.functions.util.runCommandAsChildProcess(`${game.config.general.editor} "${game.functions.util.dirname() + path}"`);
        // The `runCommandAsChildProcess` shows an error message for us, but we need to pause.
        if (!success) {
            game.pause();
        }

        finishedCards.push(path);
        matchingCards.splice(index, 1);

        if (matchingCards.length <= 0) {
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
