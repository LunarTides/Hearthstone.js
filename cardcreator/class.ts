/**
 * This is the class creator.
 * @module Class Creator
 */

import * as lib from "./lib.js";

import { createGame } from "../src/internal.js";
import { Blueprint, CardClass, CardRarity, CardType } from "../src/types.js";

const { game, player1, player2 } = createGame();

/**
 * Asks the user a series of questions, and creates a class card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 */
export function main() {
    let watermark = () => {
        game.interact.cls();
        game.log("Hearthstone.js Class Creator (C) 2022\n");
        game.log("type 'back' at any step to cancel.\n");
    }

    const questions = [
        "What should the name of the class be?",
        "What should the default hero's name be?",
        "What should the description of the hero power be? (example: Deal 2 damage to the enemy hero.):",
        "How much should the hero power cost? (Default is 2):"
    ]

    let answers: string[] = [];
    let exited = false;

    // Ask the questions as defined above and push the answer to answers
    questions.forEach(c => {
        if (exited) return;

        const question = c;

        watermark();
        let val = game.input(question + " ");
        if (!val || game.interact.shouldExit(val)) exited = true;

        answers.push(val);
    });

    if (exited) return;

    let [name, displayName, hpDesc, hpCost] = answers;

    let filename = name.toLowerCase().replaceAll(" ", "_") + ".mts";

    let card: Blueprint = {
        name: name + " Starting Hero",
        displayName: displayName,
        desc: name[0].toUpperCase() + name.slice(1).toLowerCase() + " starting hero",
        cost: 0,
        type: "Hero" as CardType,
        classes: [name] as CardClass[],
        rarity: "Free" as CardRarity,
        hpDesc: hpDesc,
        hpCost: parseInt(hpCost),
        uncollectible: true,
        // This will be overwritten by the library
        id: 0,
    };

    lib.create("Class", "Hero", card, game.functions.dirname() + "../cards/StartingHeroes/", filename);

    game.log("\nClass Created!");
    game.log(`Next steps:`);
    game.log(`1. Open 'src/types.ts', navigate to 'CardClass', and add the name of the class to that. There is unfortunately no way to automate that.`);
    game.log(`2. Open 'cards/StartingHeroes/${filename}' and add logic to the 'heropower' function.`);
    game.log(`3. Now when using the Custom Card Creator, type '${name}' into the 'Class' field to use that class.`);
    game.log(`4. When using the Deck Creator, type '${name}' to create a deck with cards from your new class.`);
    game.log(`Enjoy!`);
}
