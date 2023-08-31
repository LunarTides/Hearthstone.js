import * as rl from "readline-sync";
import * as lib from "../lib.js";

import { Game, Player } from "../../src/internal.js";
import { CardClass, CardRarity, CardType } from "../../src/types.js";

const player1 = new Player("Player 1");
const player2 = new Player("Player 2");
const game = new Game(player1, player2);
game.functions.importCards("../../cards");
game.functions.importConfig("../../config");

export function main() {
    let watermark = () => {
        game.interact.cls();
        console.log("Hearthstone.js Class Creator (C) 2022\n");
        console.log("type 'back' at any step to cancel.\n");
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
        let val = rl.question(question + " ");
        if (!val || val.toLowerCase() == "back") exited = true;

        answers.push(val);
    });

    if (exited) return;

    let [name, displayName, hpDesc, hpCost] = answers;

    let filename = name.toLowerCase().replaceAll(" ", "_") + ".ts";

    let card = {
        name: name + " Starting Hero",
        displayName: displayName,
        desc: name[0].toUpperCase() + name.slice(1).toLowerCase() + " starting hero",
        mana: 0,
        type: "Hero" as CardType,
        class: name as CardClass,
        rarity: "Free" as CardRarity,
        hpDesc: hpDesc,
        hpCost: parseInt(hpCost),
        uncollectible: true
    };

    lib.set_type("Class");
    lib.create("Hero", card, "../../cards/StartingHeroes/", filename);

    console.log("\nClass Created!");
    rl.question(`Next steps:\n1. Open 'cards/StartingHeroes/${filename}' and add logic to the 'heropower' function.\n2. Now when using the Card Creator, type '${name}' into the 'Class' field to use that class\n3. When using the Deck Creator, type '${name}' to create a deck with cards from your new class.\nEnjoy!\n`);
}

