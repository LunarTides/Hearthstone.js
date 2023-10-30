/**
 * A collection of functions relating to reading and writing ids of blueprints.
 *
 * @module Id Script
 */

import { createGame } from '../../src/internal.js';

const { game } = createGame();

const ID_REGEX = /id: (\d+)/;

function searchCards(callback: (path: string, content: string, id: number) => void) {
    game.functions.util.searchCardsFolder((fullPath, content) => {
        const ID_MATCH = ID_REGEX.exec(content);
        if (!ID_MATCH) {
            game.logError(`No id found in ${fullPath}`);
            return;
        }

        const ID = Number(ID_MATCH[1]);
        callback(fullPath, content, ID);
    });
}

function change(startId: number, callback: (id: number) => number, log: boolean) {
    let updated = 0;

    searchCards((path, content, id) => {
        if (id < startId) {
            if (log) {
                game.log(`<bright:yellow>Skipping ${path}</bright:yellow>`);
            }

            return;
        }

        const NEW_ID = callback(id);

        // Set the new id
        game.functions.util.fs('write', path, content.replace(ID_REGEX, `id: ${NEW_ID}`));

        if (log) {
            game.log(`<bright:green>Updated ${path}</bright:green>`);
        }

        updated++;
    });

    if (updated > 0) {
        const LATEST_ID = Number(game.functions.util.fs('read', '/cards/.latestId'));
        const NEW_LATEST_ID = callback(LATEST_ID);

        game.functions.util.fs('write', '/cards/.latestId', NEW_LATEST_ID.toString());
    }

    if (log) {
        if (updated > 0) {
            game.log('<bright:green>Updated %s cards.</bright:green>', updated);
        } else {
            game.log('<yellow>No cards were updated.</yellow>');
        }
    }

    return updated;
}

/**
 * Decrement the ids of all cards from a starting id.
 * If the starting id is 50, it will decrement the ids of all cards with an id of 50 or more.
 * This is useful if you delete a card, and want to decrement the ids of the remaining cards to match.
 *
 * @param startId The starting id
 * @param log If it should log what it's doing. This should probably be false when using this as a library.
 *
 * @returns The number of cards that were updated
 */
export function decrement(startId: number, log: boolean) {
    return change(startId, id => id - 1, log);
}

/**
 * Increment the ids of all cards from a starting id.
 * If the starting id is 50, it will increment the ids of all cards with an id of 50 or more.
 * This is useful if you add a card between two ids, and want to increment the ids of the remaining cards to match.
 *
 * @param startId The starting id
 * @param log If it should log what it's doing. This should probably be false when using this as a library.
 *
 * @returns The number of cards that were updated
 */
export function increment(startId: number, log: boolean) {
    return change(startId, id => id + 1, log);
}

/**
 * Check for holes in the ids.
 * If there is a card with an id of 58 and a card with an id of 60, but no card with an id of 59, that is a hole.
 *
 * @param log If it should log what it's doing. This should probably be false when using this as a library.
 *
 * @returns Amount of holes, and amount of duplicates
 */
export function validate(log: boolean): [number, number] {
    const IDS: [[number, string]] = [[-1, '']];

    searchCards((path, content, id) => {
        IDS.push([id, path]);
    });

    IDS.sort((a, b) => a[0] - b[0]);

    // Check if there are any holes
    let currentId = 0;
    let holes = 0;
    let duplicates = 0;

    for (const [ID, PATH] of IDS) {
        if (ID === -1) {
            continue;
        }

        if (ID === currentId) {
            if (log) {
                game.logError(`<bright:yellow>Duplicate id in ${PATH}. Previous id: ${currentId}. Got id: ${ID}. <green>Suggestion: Change one of these ids.</green bright:yellow>`);
            }

            duplicates++;
        } else if (ID !== currentId + 1) {
            if (log) {
                game.logError(`<bright:yellow>Hole in ${PATH}. Previous id: ${currentId}. Got id: ${ID}. <green>Suggestion: Change card with id ${ID} to ${ID - 1}</green bright:yellow>`);
            }

            holes++;
        }

        currentId = ID;
    }

    // Check if the .latestId is valid
    const LATEST_ID = game.lodash.parseInt((game.functions.util.fs('read', '/cards/.latestId') as string).trim());
    if (LATEST_ID !== currentId) {
        if (log) {
            game.log('<yellow>Latest id is invalid. Latest id found: %s, latest id in file: %s. Fixing...</yellow>', currentId, LATEST_ID);
        }

        game.functions.util.fs('write', '/cards/.latestId', currentId.toString());
    }

    if (log) {
        if (holes > 0) {
            game.log('<yellow>Found %s holes.</yellow>', holes);
        } else {
            game.log('<bright:green>No holes found.</bright:green>');
        }

        if (duplicates > 0) {
            game.log('<yellow>Found %s duplicates.</yellow>', duplicates);
        } else {
            game.log('<bright:green>No duplicates found.</bright:green>');
        }

        if (LATEST_ID === currentId) {
            game.log('<bright:green>Latest id up-to-date.</bright:green>');
        }
    }

    return [holes, duplicates];
}
