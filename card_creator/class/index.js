const rl = require("readline-sync");
const cc = require("../index");

const { Game } = require("../../src/game");

const game = new Game({}, {});
game.functions.importCards(__dirname + "/../../cards");
game.functions.importConfig(__dirname + "/../../config");

function main() {
    let watermark = () => {
        process.stdout.write("\033c");
        console.log("Hearthstone.js Class Creator (C) 2022\n");
        console.log("type 'back' at any step to cancel.\n");
    }

    const questions = [
        "What should the name of the class be?",
        "What should the default hero's name be?",
        "What should the description of the hero power be? (example: Deal 2 damage to the enemy hero.):",
        "How much should the hero power cost? (Default is 2):"
    ]

    let answers = [];
    let exited = false;

    // Ask the questions as defined above and push the answer to answers
    questions.forEach(c => {
        if (exited) return;

        const question = c;

        watermark();
        let val = rl.question(question + " ");
        if (!val || val[0].toLowerCase() == "b") exited = true;

        answers.push(val);
    });

    if (exited) return;

    let [name, displayName, hpDesc, hpCost] = answers;
    hpCost = parseInt(hpCost);

    let filename = name.toLowerCase().replaceAll(" ", "_") + ".js";

    cc.set_type("Class");
    cc.main("Hero", __dirname + "/../../cards/StartingHeroes/", filename, {
        name: name + " Starting Hero",
        displayName: displayName,
        desc: name[0].toUpperCase() + name.slice(1).toLowerCase() + " starting hero",
        mana: 0,
        type: "Hero",
        class: name,
        rarity: "Free",
        hpDesc: hpDesc,
        hpCost: hpCost,
        uncollectible: true
    });
    cc.set_type("Custom"); // Reset

    console.log("\nClass Created!");
    rl.question(`Next steps:\n1. Open 'cards/StartingHeroes/${filename}' and add logic to the 'heropower' function.\n2. Now when using the Card Creator, type '${name}' into the 'Class' field to use that class\n3. When using the Deck Creator, type '${name}' to create a deck with cards from your new class.\nEnjoy!\n`);
}

exports.main = main;

if (require.main == module) main();
