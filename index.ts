/**
 * The entry point of the program. Acts like a hub between the tools / scripts and the game.
 * @module Runner
 */
import * as src from "./src/index.js";                 // Source Code
import * as dc  from "./tools/deckcreator.js";         // Deck Creator
import * as ccc from "./tools/cardcreator/custom.js";  // Custom Card Creator
import * as vcc from "./tools/cardcreator/vanilla.js"; // Vanilla Card Creator
import * as clc from "./tools/cardcreator/class.js";   // Class Creator
import * as cli from "./tools/cli.js";                 // Command Line Interface

const watermark = () => {
    game.interact.cls();
    game.log("Hearthstone.js Runner V%s (C) 2022\n", game.functions.info.version(3));
}

function userInputLoop(prompt: string, exitCharacter: string | null, callback: (input: string) => void) {
    while (true) {
        watermark();

        const user = game.input(prompt);
        if (!user) continue;

        if (game.interact.shouldExit(user) || user[0].toLowerCase() === exitCharacter?.toLowerCase()) break;

        callback(user);
    }
}

function cardCreator() {
    userInputLoop("Create a (C)ustom Card, Import a (V)anilla Card, Go (B)ack: ", "b", (input) => {
        const type = input[0].toLowerCase();

        game.interact.cls();

        if (type === "v") {
            const error = game.functions.card.vanilla.getAll();

            if (error instanceof Error) {
                watermark();

                game.log(error.stack);
                game.pause();
                return;
            }

            vcc.main();
        } else if (type === "c") {
            ccc.main();
        }
    });
}

function replay() {
    game.logWarn("<yellow>WARNING: This feature is unstable. Expect bugs.</yellow>\n");
    let path = "/logs/log-" + game.input("Path: /logs/log-");
    if (!path.endsWith(".txt")) path += ".txt";

    src.main(path);
}

function devmode() {
    userInputLoop("Create a (C)ard, Create a Clas(s), Enter CLI (m)ode, Go (B)ack to Normal Mode: ", "b", (input) => {
        input = input[0].toLowerCase();

        if (input == "c") cardCreator();
        else if (input == "s") clc.main();
        else if (input == "m") cli.main(userInputLoop);
    });
}

userInputLoop("(P)lay, (R)eplay, Create a (D)eck, Developer (M)ode, (E)xit: ", "e", (input) => {
    input = input[0].toLowerCase();

    if (input == "p") src.main();
    if (input == "r") replay();
    else if (input == "d") dc.main();
    else if (input == "m") devmode();
});
