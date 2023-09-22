/**
 * The entry point of the program. Acts like a hub between the tools / scripts and the game.
 * @module Runner
 */
import * as src from "./src/index.js";           // Source Code
import * as dc  from "./tools/deckcreator.js";   // Deck Creator
import * as ccc from "./tools/cardcreator/custom.js";  // Custom Card Creator
import * as vcc from "./tools/cardcreator/vanilla.js"; // Vanilla Card Creator
import * as clc from "./tools/cardcreator/class.js";   // Class Creator

const watermark = () => {
    game.interact.cls();
    game.log("Hearthstone.js Runner V%s (C) 2022\n", game.functions.getVersion(3));
}

function cardCreator() {
    watermark();

    let choice: string = game.input("Create a (C)ustom Card, Import a (V)anilla Card, Go (B)ack: ");
    if (!choice || choice[0].toLowerCase() === "b") return;

    let isVanilla = choice[0].toLowerCase() === "v";

    game.interact.cls();

    if (isVanilla) {
        let [_, error] = game.functions.getVanillaCards();

        if (error) {
            watermark();

            game.input(error);
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

        let user = game.input("Create a (C)ard, Create a Clas(s), Go (B)ack to Normal Mode: ");
        if (!user) continue;
        
        user = user[0].toLowerCase();

        if (user == "c") cardCreator();
        if (user == "s") clc.main();
        else if (user == "b") break;
    }
}

while (true) {
    watermark();

    let user = game.input("(P)lay, Create a (D)eck, Developer (M)ode, (E)xit: ");
    if (!user) continue;

    user = user[0].toLowerCase();

    if (user == "p") src.main();
    else if (user == "d") dc.main();
    else if (user == "m") devmode();
    else if (user == "e") break;
}
