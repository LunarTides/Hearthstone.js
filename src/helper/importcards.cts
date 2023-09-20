require = require('esm')(module);

import fs from "fs";
import child_process from "child_process";

let cards: any[] = [];
let oldContent: string[][] = [];
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
            // Don't hot reload the card if it hasn't changed
            let content = fs.readFileSync(p, { encoding: "utf8" });
            let shouldHotReload = hot && !oldContent.some(c => c[0] === content);

            let f: any;

            if (shouldHotReload) f = requireFresh(p).blueprint;
            else f = require(p).blueprint;

            // Replace the content
            game.functions.remove(oldContent, oldContent.find(c => c[1] === f.id));
            oldContent.push([content, f.id]);

            if (!f) throw new Error("Card doesn't export a blueprint: " + p);
            cards.push(f);
        }
        else if (file.isDirectory()) _doImportCards(p, hot);
    });

    return cards;
}

/**
 * This can cause memory leaks with excessive usage.
 *
 * @returns The cards
 */
export function reloadCards(path: string) {
    if (game.config.advanced.reloadCommandRecompile) game.functions.runCommand(`npx tsc -p "${path}/../.."`);
    
    let result = doImportCards(path, true);
    if (!game.functions.runBlueprintValidator()) {
        game.log("<yellow>Some cards were found invalid. Please fix and reload these cards to prevent unwanted behaviour.</yellow>");
        game.input();
    };

    return result;
}
