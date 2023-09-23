/**
 * The entry point of the program. Acts like a hub between the tools / scripts and the game.
 * @module Runner
 */
import * as src from "./src/index.js";                 // Source Code
import * as dc  from "./tools/deckcreator.js";         // Deck Creator
import * as ccc from "./tools/cardcreator/custom.js";  // Custom Card Creator
import * as vcc from "./tools/cardcreator/vanilla.js"; // Vanilla Card Creator
import * as clc from "./tools/cardcreator/class.js";   // Class Creator

const watermark = () => {
    game.interact.cls();
    game.log("Hearthstone.js Runner V%s (C) 2022\n", game.functions.getVersion(3));
}

function userInputLoop(prompt: string, exitCharacter: string | null, callback: (input: string) => void) {
    while (true) {
        watermark();

        let user = game.input(prompt);
        if (!user) continue;

        if (game.interact.shouldExit(user) || user[0].toLowerCase() === exitCharacter?.toLowerCase()) break;

        callback(user);
    }
}

function cardCreator() {
    userInputLoop("Create a (C)ustom Card, Import a (V)anilla Card, Go (B)ack: ", "b", (input) => {
        let type = input[0].toLowerCase();

        game.interact.cls();

        if (type === "v") {
            let [_, error] = game.functions.getVanillaCards();

            if (error) {
                watermark();

                game.input(error);
                return;
            }

            vcc.main();
        } else if (type === "c") {
            ccc.main();
        }
    });
}

function devmode() {
    userInputLoop("Create a (C)ard, Create a Clas(s), Enter CLI (m)ode, Go (B)ack to Normal Mode: ", "b", (input) => {
        input = input[0].toLowerCase();

        if (input == "c") cardCreator();
        else if (input == "s") clc.main();
    });
}

userInputLoop("(P)lay, Create a (D)eck, Developer (M)ode, (E)xit: ", "e", (input) => {
    input = input[0].toLowerCase();

    if (input == "p") src.main();
    else if (input == "d") dc.main();
    else if (input == "m") devmode();
});
