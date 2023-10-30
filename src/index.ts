/**
 * The entry point of the game.
 *
 * Hearthstone.js - Hearthstone but console based.
 * Copyright (C) 2022  LunarTides
 *
 * @module Index
 */

import process from 'node:process';
import { type Dirent } from 'node:fs';
import { validate as validateIds } from '../scripts/id/lib.js';
import { createGame } from './internal.js';

export function main() {
    const { game, player1, player2 } = createGame();

    game.interact.info.watermark();

    // Find holes and dupes in the ids
    game.logWarn('Validating ids...');
    const [HOLES, DUPES] = validateIds(true);
    if (HOLES > 0 || DUPES > 0) {
        // If there were holes or dupes, pause the game so that the user gets a
        // chance to see what the problem was
        game.pause();
    }

    warnAboutOutdatedCards();

    // Ask the players for deck codes.
    for (const PLAYER of [player1, player2]) {
        if (PLAYER.deck.length > 0) {
            continue;
        }

        // Put this in a while loop to make sure the function repeats if it fails.
        while (!game.interact.deckCode(PLAYER)) {
            // Pass
        }
    }

    game.startGame();

    game.interact.card.mulligan(player1);
    game.interact.card.mulligan(player2);

    try {
        // Game loop
        while (game.running) {
            game.interact.gameLoop.doTurn();
        }
    } catch (error) {
        if (!(error instanceof Error)) {
            throw new TypeError('error is not of error type when catching from gameloop');
        }

        // Create error report file
        game.functions.util.createLogFile(error);

        throw error;
    }
}

let outdatedCards: string[] = [];
const OUTDATED_EXTENSIONS: string[] = [];
const UPDATED_CARDS: string[] = [];
function warnAboutOutdatedCards() {
    // TODO: This doesn't quite work. #336
    findOutdatedCards(game.functions.util.dirname() + '/cards');
    outdatedCards = outdatedCards.filter(card => !UPDATED_CARDS.includes(card));

    if (outdatedCards.length <= 0 && OUTDATED_EXTENSIONS.length <= 0) {
        return;
    }

    for (const FILE_NAME of outdatedCards) {
        game.logWarn(`<yellow>WARNING: Outdated card found: ${FILE_NAME}.js</yellow>`);
    }

    for (const FILE_NAME of OUTDATED_EXTENSIONS) {
        game.logWarn(`<yellow>WARNING: Outdated extension found: ${FILE_NAME}.mts. Please change all card file names ending with the '.mts' extension to '.ts' instead.</yellow>`);
    }

    game.logWarn('Run the `upgradecards` script to automatically update outdated cards from pre 2.0.');
    game.logWarn('This will only upgrade pre 2.0 cards to 2.0 cards.');
    game.logWarn('You can play the game without upgrading the cards, but the cards won\'t be registered.');
    game.logWarn('Run the script by running `npm run script:upgradecards`.');

    const PROCEED = game.input('\nDo you want to proceed? ([y]es, [n]o): ').toLowerCase().startsWith('y');
    if (!PROCEED) {
        process.exit(0);
    }
}

function findOutdatedCards(path: string) {
    if (path.includes('cards/Test')) {
        return;
    }

    for (const FILE of game.functions.util.fs('readdir', path, { withFileTypes: true }) as Dirent[]) {
        const PATH = `${path}/${FILE.name}`.replace('/dist/..', '');

        if (FILE.name.endsWith('.mts')) {
            OUTDATED_EXTENSIONS.push(PATH.slice(0, -4));
        }

        if (FILE.name.endsWith('.js')) {
            outdatedCards.push(PATH.slice(0, -3));
        }

        if (FILE.name.endsWith('.ts')) {
            UPDATED_CARDS.push(PATH.slice(0, -3));
        } else if (FILE.isDirectory()) {
            findOutdatedCards(PATH);
        }
    }
}
