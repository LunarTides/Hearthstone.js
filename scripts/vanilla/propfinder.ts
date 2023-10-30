/**
 * @module Vanilla Card Property Finder
 */

import { createGame } from '../../src/internal.js';

const { game } = createGame();

const PROPS: Record<string, [string, number]> = {};
const TYPES: Record<string, number> = {};

const STORED: Array<[string, number]> = [];
const STORED_TYPE = 'mechanics';

function handleStoredTypes(value: any) {
    const VALUES = Array.isArray(value) ? value : [value];

    for (const VALUE of VALUES) {
        if (typeof VALUE !== 'string') {
            throw new TypeError('v is not a string');
        }

        const FOUND = STORED.find(s => game.lodash.isEqual(s[0], VALUE));
        if (FOUND) {
            FOUND[1]++;
        } else {
            STORED.push([VALUE, 1]);
        }
    }
}

function main() {
    const VANILLA_CARDS = game.functions.card.vanilla.getAll();

    for (const VANILLA_CARD of VANILLA_CARDS) {
        for (const ENTRY of Object.entries(VANILLA_CARD)) {
            const [KEY, VALUE] = ENTRY;

            if (KEY === STORED_TYPE) {
                handleStoredTypes(VALUE);
            }

            if (Object.keys(PROPS).includes(KEY)) {
                const STORED_TYPE = PROPS[KEY][0];
                if (STORED_TYPE !== typeof VALUE) {
                    game.logWarn('<yellow>Discrepancy found. Stored type: %s, Found type %s.</yellow>', STORED_TYPE, typeof VALUE);
                }

                PROPS[KEY][1]++;
                continue;
            }

            PROPS[KEY] = [typeof VALUE, 1];
        }

        if (Object.keys(TYPES).includes(VANILLA_CARD.type)) {
            TYPES[VANILLA_CARD.type]++;
            continue;
        }

        TYPES[VANILLA_CARD.type] = 1;
    }

    game.log('<b>TYPES:</b>');
    game.log(TYPES);
    game.log('<b>PROPS:</b>');
    game.log(PROPS);
    game.log('<b>STORED:</b>');
    game.log(STORED.sort((a, b) => b[1] - a[1]));
}

main();
