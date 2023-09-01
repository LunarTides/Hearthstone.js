require = require('esm')(module);

import { Dirent } from "fs";
import fs from "fs";

const cards: any[] = [];

export function doImportCards(path: string) {
    fs.readdirSync(path, { withFileTypes: true }).forEach((file: Dirent) => {
        let p = `${path}/${file.name}`;

        if (file.name.endsWith(".mjs")) {
            // Synchronously import the card without using require
            let f = require(p).default;
            cards.push(f);
        }
        else if (file.isDirectory()) doImportCards(p);
    });

    return cards;
}