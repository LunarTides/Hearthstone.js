require = require('esm')(module);

import { Dirent } from "fs";
import fs from "fs";

let cards: any[] = [];
let config: object = {};

export function doImportCards(path: string) {
    cards = [];
    return _doImportCards(path);
}
function _doImportCards(path: string) {
    fs.readdirSync(path, { withFileTypes: true }).forEach((file: Dirent) => {
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

export function doImportConfig(path: string) {
    config = {};
    return _doImportConfig(path);
}
function _doImportConfig(path: string) {
    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        let c = `${path}/${file.name}`;

        if (file.name.endsWith(".json")) {
            let f = require(c);

            config = Object.assign({}, config, f);
        }
        else if (file.isDirectory()) _doImportConfig(c);
    });

    return config;
}

export function reloadCards(path: string) {
    // TODO: This doesn't work
    Object.keys(require.cache).forEach(k => delete require.cache[k]);
    return doImportCards(path);
}