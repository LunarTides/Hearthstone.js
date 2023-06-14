const rl = require("readline-sync");
const fs = require("fs");
const { version, branch } = require("./config/dont-change.json");

const src = require("./src/index");                  // Source Code
const dc = require("./deck_creator/index");          // Deck Creator
const cc = require("./card_creator/index");          // Custom Card Creator
const vcc = require("./card_creator/vanilla/index"); // Vanilla Card Creator
const ccc = require("./card_creator/class/index");   // Class Card Creator

// TODO: Make sure this works on windows.
const cls = () => process.stdout.write("\x1bc");

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

function cardCreator() {
    watermark();

    let vanilla = rl.question("Create a (C)ustom Card, or import a (V)anilla Card: ");
    if (!vanilla) return;

    vanilla = vanilla[0].toLowerCase() == "v";

    cls();

    if (vanilla) {
        if (!fs.existsSync("./card_creator/vanilla/.ignore.cards.json")) {
            watermark();

            rl.question("Cards file not found! Run 'scripts/genvanilla.bat' (requires an internet connection), then try again.\n");
            return;
        }

        vcc.main();
    } else {
        cc.main();
    }
}

function devmode() {
    while (true) {
        watermark();

        let user = rl.question("Create a (C)ard, Create a Clas(s), Go (B)ack to Normal Mode: ");
        if (!user) continue;
        
        user = user[0].toLowerCase();

        if (user == "c") cardCreator();
        if (user == "s") ccc.main();
        else if (user == "b") break;
    }
}

exports.store_deck = store_deck;
exports.free_decks = free_decks;

while (true) {
    watermark();

    let user = rl.question("(P)lay, Create a (D)eck, Developer (M)ode, (E)xit: ");
    if (!user) continue;

    user = user[0].toLowerCase();

    if (user == "p") src.runner(decks);
    else if (user == "d") dc.runner();
    else if (user == "m") devmode();
    else if (user == "e") process.exit(0);
}
