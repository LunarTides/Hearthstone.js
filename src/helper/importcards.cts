require = require('esm')(module);

import fs from "fs";

let cards: any[] = [];

export function doImportCards(path: string) {
    cards = [];
    return _doImportCards(path);
}
function _doImportCards(path: string) {
    fs.readdirSync(path, { withFileTypes: true }).forEach((file: fs.Dirent) => {
        let p = `${path}/${file.name}`;

        if (file.name.endsWith(".mjs")) {
            // Synchronously import the card without using require
            let f = require(p).blueprint;

            if (!f) throw new Error("Card doesn't export a blueprint: " + p);
            cards.push(f);
        }
        else if (file.isDirectory()) _doImportCards(p);
    });

    return cards;
}

export function reloadCards(path: string) {
    // TODO: This doesn't work
    Object.keys(require.cache).forEach(k => delete require.cache[k]);
    return doImportCards(path);
}
