import config from "./config/dont-change.json" assert { type: "json" };

import * as rl from "readline-sync";
import * as fs from "fs";

import * as src from "./src/index.js";                  // Source Code
import * as dc  from "./deck_creator/index.js";         // Deck Creator
import * as ccc from "./card_creator/custom/index.js";  // Custom Card Creator
import * as vcc from "./card_creator/vanilla/index.js"; // Vanilla Card Creator
import * as clc from "./card_creator/class/index.js";   // Class Creator

const cls = () => process.stdout.write("\x1bc");

const watermark = () => {
    cls();
    console.log(`Hearthstone.js Runner V${config.version}-${config.branch} (C) 2022\n`);
}

let decks: string[] = [];

export function store_deck(deckcode: string) {
    decks.push(deckcode);
}
export function free_decks() {
    decks = [];
}

function cardCreator() {
    watermark();

    let vanilla: string | boolean = rl.question("Create a (C)ustom Card, or import a (V)anilla Card: ");
    if (!vanilla) return;

    vanilla = vanilla[0].toLowerCase() == "v";

    cls();

    if (vanilla) {
        if (!fs.existsSync(game.functions.dirname() + "../card_creator/vanilla/.ignore.cards.json")) {
            watermark();

            rl.question("Cards file not found! Run 'scripts/genvanilla.bat' (requires an internet connection), then try again.\n");
            return;
        }

        vcc.main();
    } else {
        ccc.main();
    }
}

function devmode() {
    while (true) {
        watermark();

        let user = rl.question("Create a (C)ard, Create a Clas(s), Go (B)ack to Normal Mode: ");
        if (!user) continue;
        
        user = user[0].toLowerCase();

        if (user == "c") cardCreator();
        if (user == "s") clc.main();
        else if (user == "b") break;
    }
}

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
