/**
 * The entry point of the program. Acts like a hub between the tools / scripts and the game.
 * @module Runner
 */
import rl from "readline-sync";
import fs from "fs";
import toml from "toml";

import * as src from "./src/index.js";                 // Source Code
import * as dc  from "./deckcreator/index.js";         // Deck Creator
import * as ccc from "./cardcreator/custom/index.js";  // Custom Card Creator
import * as vcc from "./cardcreator/vanilla/index.js"; // Vanilla Card Creator
import * as clc from "./cardcreator/class/index.js";   // Class Creator
import { GameConfig } from "@Game/types.js";

let config: GameConfig = toml.parse(fs.readFileSync("./config.toml", { encoding: "utf8" }));

const cls = () => process.stdout.write("\x1bc");

const watermark = () => {
    cls();
    console.log(`Hearthstone.js Runner V${config.info.version}-${config.info.branch} (C) 2022\n`);
}

function cardCreator() {
    watermark();

    let choice: string = rl.question("Create a (C)ustom Card, Import a (V)anilla Card, Go (B)ack: ");
    if (!choice || choice[0].toLowerCase() === "b") return;

    let isVanilla = choice[0].toLowerCase() === "v";

    cls();

    if (isVanilla) {
        if (!fs.existsSync(game.functions.dirname() + "../cardcreator/vanilla/.ignore.cards.json")) {
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

    if (user == "p") src.main();
    else if (user == "d") dc.main();
    else if (user == "m") devmode();
    else if (user == "e") process.exit(0);
}
