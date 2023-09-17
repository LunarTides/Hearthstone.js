require = require('esm')(module);

import fs from "fs";

let cards: any[] = [];
let c = 1;

function requireFresh(mod: string) {
    return require(`${mod}?v=${c++}`);
}

/**
 * Import cards.
 *
 * If hot is true, fresh import the cards. This can cause memory leaks over time.
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
 */
export function reloadCards(path: string) {
    return doImportCards(path, true);
}
