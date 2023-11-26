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
    for (const question of questions) {
        if (exited) {
            continue;
        }

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

    const [className, heroName, hpText, hpCost] = answers;

    const fileName = className.toLowerCase().replaceAll(' ', '_') + '.ts';

    const blueprint: Blueprint = {
        name: heroName,
        text: className[0].toUpperCase() + className.slice(1).toLowerCase() + ' starting hero',
        cost: 0,
        type: 'Hero' as CardType,
        hpText,
        hpCost: game.lodash.parseInt(hpCost),
        classes: [className] as CardClass[],
        rarity: 'Free' as CardRarity,
        uncollectible: true,
        // This will be overwritten by the library
        id: 0,
    };

    let cctype: lib.CcType = 'Class';
    if (overrideType) {
        cctype = overrideType;
    }

    lib.create(cctype, 'Hero', blueprint, '/cards/StartingHeroes/', fileName, debug);

    game.log('\nClass Created!');
    game.log('Next steps:');
    game.log('1. Open \'src/types.ts\', navigate to \'CardClass\', and add the name of the class to that. There is unfortunately no way to automate that.');
    game.log(`2. Open 'cards/StartingHeroes/${fileName}' and add logic to the 'heropower' function.`);
    game.log(`3. Now when using the Custom Card Creator, type '${className}' into the 'Class' field to use that class.`);
    game.log(`4. When using the Deck Creator, type '${className}' to create a deck with cards from your new class.`);
    game.log('Enjoy!');
    game.pause();
}
