/**
 * The card parity script.
 * @module Card Parity
 */

import { type Card as VanillaCard } from '@hearthstonejs/vanillatypes';
import { type Card, createGame } from '../../src/internal.js';
import { type Blueprint } from '../../src/types.js';

const { game } = createGame();

function main() {
    const VANILLA_CARDS = game.functions.card.vanilla.getAll();

    const FILTERED_VANILLA_CARDS = game.functions.card.vanilla.filter(VANILLA_CARDS, false, false);
    const CUSTOM_CARDS = game.functions.card.getAll(false);

    for (const CUSTOM of CUSTOM_CARDS) {
        // Find the equivalent vanilla card
        let vanilla = FILTERED_VANILLA_CARDS.find(vanilla => (
            vanilla.name.toLowerCase() === CUSTOM.displayName.toLowerCase()
                && vanilla.type.toLowerCase() === CUSTOM.type.toLowerCase()
        ));

        // There is no vanilla version of that card.
        if (!vanilla) {
            continue;
        }

        for (const ENTRY of Object.entries(CUSTOM)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const [KEY, VALUE] = ENTRY;

            // HACK: For some reason, typescript thinks that vanilla can be undefined
            vanilla = vanilla!;

            if (KEY === 'stats') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                check('attack', VALUE[0].toString(), vanilla, CUSTOM);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                check('health', VALUE[1].toString(), vanilla, CUSTOM);
                continue;
            }

            vanilla.text = vanilla.text?.replaceAll('\n', ' ');
            vanilla.text = vanilla.text?.replaceAll('[x]', '');

            check(KEY, VALUE, vanilla, CUSTOM);
        }
    }

    function check(key: string, value: any, vanilla: VanillaCard, card: Card) {
        const IGNORE = ['id', 'set', 'name', 'rarity', 'type'];

        const TABLE: { [key in keyof Blueprint]?: keyof VanillaCard } = {
            text: 'text',
        };

        let vanillaValue: any = key as keyof VanillaCard;
        if (!vanillaValue) {
            vanillaValue = TABLE[key as keyof Blueprint];
        }

        vanillaValue = vanilla[vanillaValue as keyof VanillaCard];

        if (!vanillaValue || IGNORE.includes(key)) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (value.toString().toLowerCase() === vanillaValue?.toString().toLowerCase()) {
            return;
        }

        game.log('Card outdated!');
        game.log(`Name: ${card.name}`);
        game.log(`Local: "${key}: ${value}"`);
        game.log(`New:   "${key}: ${vanillaValue}"\n`);
    }
}

main();
