/**
 * This is the class creator.
 * @module Class Creator
 */

import { createGame } from '../../src/internal.js';
import { type Blueprint, type CardClass, type CardRarity, type CardType } from '../../src/types.js';
import * as lib from './lib.js';

const { game } = createGame();

/**
 * Asks the user a series of questions, and creates a class card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 */
export function main(debug = false, overrideType?: lib.CcType) {
    const watermark = () => {
        game.interact.cls();
        game.log('Hearthstone.js Class Creator (C) 2022\n');
        game.log('type \'back\' at any step to cancel.\n');
    };

    const questions = [
        'What should the name of the class be?',
        'What should the default hero\'s name be?',
        'What should the description of the hero power be? (example: Deal 2 damage to the enemy hero.):',
        'How much should the hero power cost? (Default is 2):',
    ];

    const answers: string[] = [];
    let exited = false;

    // Ask the questions as defined above and push the answer to answers
    for (const c of questions) {
        if (exited) {
            continue;
        }

        const question = c;

        watermark();
        const value = game.input(question + ' ');
        if (!value || game.interact.shouldExit(value)) {
            exited = true;
        }

        answers.push(value);
    }

    if (exited) {
        return;
    }

    const [name, displayName, hpText, hpCost] = answers;

    const filename = name.toLowerCase().replaceAll(' ', '_') + '.ts';

    const card: Blueprint = {
        name: name + ' Starting Hero',
        displayName,
        text: name[0].toUpperCase() + name.slice(1).toLowerCase() + ' starting hero',
        cost: 0,
        type: 'Hero' as CardType,
        hpText,
        hpCost: game.lodash.parseInt(hpCost),
        classes: [name] as CardClass[],
        rarity: 'Free' as CardRarity,
        uncollectible: true,
        // This will be overwritten by the library
        id: 0,
    };

    let cctype: lib.CcType = 'Class';
    if (overrideType) {
        cctype = overrideType;
    }

    lib.create(cctype, 'Hero', card, '/cards/StartingHeroes/', filename, debug);

    game.log('\nClass Created!');
    game.log('Next steps:');
    game.log('1. Open \'src/types.ts\', navigate to \'CardClass\', and add the name of the class to that. There is unfortunately no way to automate that.');
    game.log(`2. Open 'cards/StartingHeroes/${filename}' and add logic to the 'heropower' function.`);
    game.log(`3. Now when using the Custom Card Creator, type '${name}' into the 'Class' field to use that class.`);
    game.log(`4. When using the Deck Creator, type '${name}' to create a deck with cards from your new class.`);
    game.log('Enjoy!');
    game.pause();
}
