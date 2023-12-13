/**
 * @module Vanilla Card Property Finder
 */

import { createGame } from '../../src/internal.js';

const { game } = createGame();

const props: Record<string, [string, number]> = {};
const types: Record<string, number> = {};

const stored: Array<[string, number]> = [];
const storedType = 'mechanics';

function handleStoredTypes(value: any): void {
    const values = Array.isArray(value) ? value : [value];

    for (const value of values) {
        if (typeof value !== 'string') {
            throw new TypeError('v is not a string');
        }

        const found = stored.find(s => game.lodash.isEqual(s[0], value));
        if (found) {
            found[1]++;
        } else {
            stored.push([value, 1]);
        }
    }
}

function main(): void {
    const vanillaCards = game.functions.card.vanilla.getAll();

    for (const vanillaCard of vanillaCards) {
        for (const entry of Object.entries(vanillaCard)) {
            const [key, value] = entry;

            if (key === storedType) {
                handleStoredTypes(value);
            }

            if (Object.keys(props).includes(key)) {
                const storedType = props[key][0];
                if (storedType !== typeof value) {
                    console.warn('<yellow>Discrepancy found. Stored type: %s, Found type %s.</yellow>', storedType, typeof value);
                }

                props[key][1]++;
                continue;
            }

            props[key] = [typeof value, 1];
        }

        if (Object.keys(types).includes(vanillaCard.type)) {
            types[vanillaCard.type]++;
            continue;
        }

        types[vanillaCard.type] = 1;
    }

    console.log('<b>TYPES:</b>');
    console.log(types);
    console.log('<b>PROPS:</b>');
    console.log(props);
    console.log('<b>STORED:</b>');
    console.log(stored.sort((a, b) => b[1] - a[1]));
}

main();
