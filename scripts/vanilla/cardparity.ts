/**
 * The card parity script.
 * @module Card Parity
 */

import { type Card as VanillaCard } from '@hearthstonejs/vanillatypes';
import { type Card, createGame } from '../../src/internal.js';
import { type Blueprint } from '../../src/types.js';

const { game } = createGame();

/**
 * Runs the card parity script.
 */
function main(): void {
    const vanillaCards = game.functions.card.vanilla.getAll();

    const filteredVanillaCards = game.functions.card.vanilla.filter(vanillaCards, false, false);
    const customCards = game.functions.card.getAll(false);

    for (const custom of customCards) {
        // Find the equivalent vanilla card
        const vanilla = filteredVanillaCards.find(vanilla => (
            vanilla.name.toLowerCase() === custom.name.toLowerCase()
                && vanilla.type.toLowerCase() === custom.type.toLowerCase()
        ));

        // There is no vanilla version of that card.
        if (!vanilla) {
            continue;
        }

        for (const entry of Object.entries(custom)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const [key, value] = entry;

            vanilla.text = vanilla.text?.replaceAll('\n', ' ');
            vanilla.text = vanilla.text?.replaceAll('[x]', '');

            check(key, value, vanilla, custom);
        }
    }
}

/**
 * Checks the given key and value against the vanilla card and logs a message if they are different.
 *
 * @param key The key to check against the vanilla card.
 * @param value The value to check against the vanilla card.
 * @param vanilla The vanilla card object to check against.
 * @param card The card object to log information about.
 */
function check(key: string, value: any, vanilla: VanillaCard, card: Card): void {
    const ignore = ['id', 'set', 'name', 'rarity', 'type'];

    const table: { [key in keyof Blueprint]?: keyof VanillaCard } = {
        text: 'text',
    };

    let vanillaValue: any = key as keyof VanillaCard;
    if (!vanillaValue) {
        vanillaValue = table[key as keyof Blueprint];
    }

    vanillaValue = vanilla[vanillaValue as keyof VanillaCard];

    if (!vanillaValue || ignore.includes(key)) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (value.toString().toLowerCase() === vanillaValue.toString().toLowerCase()) {
        return;
    }

    console.log('Card outdated!');
    console.log(`Name: ${card.name} (${card.id})`);
    console.log(`Local: "${key}: ${value}"`);
    console.log(`New:   "${key}: ${vanillaValue}"\n`);
}

main();
