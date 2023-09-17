require = require('esm')(module);

import fs from "fs";
import child_process from "child_process";

let cards: any[] = [];
let c = 1;

function requireFresh(mod: string) {
    return require(`${mod}?v=${c++}`);
}

/**
 * Import cards.
 *
 * If hot is true, fresh import the cards. This can cause memory leaks over time.
 *
 * @returns The cards
 */
export function doImportCards(path: string, hot = false) {
    cards = [];
    return _doImportCards(path, hot);
}
function _doImportCards(path: string, hot = false) {
    fs.readdirSync(path, { withFileTypes: true }).forEach((file: fs.Dirent) => {
        let p = `${path}/${file.name}`;

        if (file.name.endsWith(".mjs")) {
            // Synchronously import the card without using require
            let f;

            if (hot) f = requireFresh(p).blueprint;
            else f = require(p).blueprint;

            if (!f) throw new Error("Card doesn't export a blueprint: " + p);
            cards.push(f);
        }
        else if (file.isDirectory()) _doImportCards(p);
    });

    return cards;
}

/**
 * This can cause memory leaks with excessive usage.
 *
 * @returns The cards
 */
export function reloadCards(path: string) {
    if (game.config.advanced.reloadCommandRecompile) child_process.execSync(`npx tsc -p "${path}/../.."`);
    
    let result = doImportCards(path, true);
    if (!game.functions.runBlueprintValidator()) {
        game.log("<yellow>Some cards were found invalid. Please fix and reload these cards to prevent unwanted behaviour.</yellow>");
        game.input();
    };

    return result;
}
