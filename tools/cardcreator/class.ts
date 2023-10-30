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

    const QUESTIONS = [
        'What should the name of the class be?',
        'What should the default hero\'s name be?',
        'What should the description of the hero power be? (example: Deal 2 damage to the enemy hero.):',
        'How much should the hero power cost? (Default is 2):',
    ];

    const ANSWERS: string[] = [];
    let exited = false;

    // Ask the questions as defined above and push the answer to answers
    for (const QUESTION of QUESTIONS) {
        if (exited) {
            continue;
        }

        watermark();
        const VALUE = game.input(QUESTION + ' ');
        if (!VALUE || game.interact.shouldExit(VALUE)) {
            exited = true;
        }

        ANSWERS.push(VALUE);
    }

    if (exited) {
        return;
    }

    const [NAME, DISPLAY_NAME, HP_TEXT, HP_COST] = ANSWERS;

    const FILE_NAME = NAME.toLowerCase().replaceAll(' ', '_') + '.ts';

    const BLUEPRINT: Blueprint = {
        name: NAME + ' Starting Hero',
        displayName: DISPLAY_NAME,
        text: NAME[0].toUpperCase() + NAME.slice(1).toLowerCase() + ' starting hero',
        cost: 0,
        type: 'Hero' as CardType,
        hpText: HP_TEXT,
        hpCost: game.lodash.parseInt(HP_COST),
        classes: [NAME] as CardClass[],
        rarity: 'Free' as CardRarity,
        uncollectible: true,
        // This will be overwritten by the library
        id: 0,
    };

    let cctype: lib.CcType = 'Class';
    if (overrideType) {
        cctype = overrideType;
    }

    lib.create(cctype, 'Hero', BLUEPRINT, '/cards/StartingHeroes/', FILE_NAME, debug);

    game.log('\nClass Created!');
    game.log('Next steps:');
    game.log('1. Open \'src/types.ts\', navigate to \'CardClass\', and add the name of the class to that. There is unfortunately no way to automate that.');
    game.log(`2. Open 'cards/StartingHeroes/${FILE_NAME}' and add logic to the 'heropower' function.`);
    game.log(`3. Now when using the Custom Card Creator, type '${NAME}' into the 'Class' field to use that class.`);
    game.log(`4. When using the Deck Creator, type '${NAME}' to create a deck with cards from your new class.`);
    game.log('Enjoy!');
    game.pause();
}
