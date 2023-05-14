const rl = require("readline-sync");
const fs = require("fs");
const { version, branch } = require("./config/general.json");

const cls = () => process.stdout.write("\033c");

const watermark = () => {
    cls();
    console.log(`Hearthstone.js Runner V${version}-${branch} (C) 2022\n`);
}

decks = [];

function store_deck(deckcode) {
    decks.push(deckcode);
}
function free_decks() {
    decks = [];
}

function devmode() {
    while (true) {
        watermark();

        let user = rl.question("Create a (C)ard, Create a Clas(s), Go (B)ack to Normal Mode: ");
        if (!user) continue;
        
        user = user[0].toLowerCase();

        if (user == "c") {
            watermark();

            let vanilla = rl.question("Create a (C)ustom Card, or import a (V)anilla Card: ");
            if (!vanilla) continue;

            vanilla = vanilla[0].toLowerCase() == "v";

            cls();

            if (vanilla) {
                if (!fs.existsSync("./card_creator/vanilla/.ignore.cards.json")) {
                    watermark();

                    rl.question("Cards file not found! Run 'genvanilla.bat' (requires an internet connection), then try again.\n");
                    continue;
                }

                require("./card_creator/vanilla/index").main("./card_creator/vanilla");
            } else {
                require("./card_creator/index").main();
            }
        }
        if (user == "s") {
            let _watermark = () => {
                watermark();
                console.log("type 'back' at any step to cancel.\n");
            }
            _watermark();

            let name = rl.question("What should the name of the class be? ");
            if (!name || name[0].toLowerCase() == "b") continue;

            _watermark();

            let displayName = rl.question("What should the display name be? ");
            if (!displayName || displayName[0].toLowerCase() == "b") continue;

            _watermark();

            let hpDesc = rl.question("What is the description of the hero power? (fex: Deal 2 damage to the enemy hero.): ");
            if (!hpDesc || hpDesc[0].toLowerCase() == "b") continue;

            _watermark();

            let hpCost = rl.question("How much should the hero power cost? (Default is 2): ");
            if (!hpCost) hpCost = 2;
            if (hpCost[0].toLowerCase() == "b") continue;
            hpCost = parseInt(hpCost);

            _watermark();

            let filename = name.toLowerCase().replaceAll(" ", "_") + ".js";
            require("./card_creator/index").main("Hero", __dirname + "/cards/StartingHeroes/", filename, {
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

            console.log("\nClass Created!");
            rl.question(`Next steps:\n1. Open 'cards/StartingHeroes/${filename}' and add logic to the 'heropower' function.\n2. Now when using the Card Creator, type '${name}' into the 'Class' field to use that class\n3. When using the Deck Creator, type '${name}' to create a deck with cards from your new class.\nEnjoy!\n`);
        }
        else if (user == "b") {
            break;
        }
    }
}

exports.store_deck = store_deck;
exports.free_decks = free_decks;

while (true) {
    watermark();

    let user = rl.question("(P)lay, Create a (D)eck, Developer (M)ode, (E)xit: ");
    if (!user) continue;

    user = user[0].toLowerCase();

    if (user == "p") require("./src/index").runner(decks);
    else if (user == "d") require("./deck_creator/index").runner();
    else if (user == "m") devmode();
    else if (user == "e") process.exit(0);
}
