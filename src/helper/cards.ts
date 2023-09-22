import { Blueprint } from "@Game/types.js";
import * as cards from "../../cards/exports.js"
import { writeFileSync } from "fs";

export function doImportCards() {
    game.cards = Object.values(cards) as Blueprint[];
}

export function generateCardExports() {
    let exportContent = "// This file has been automatically created. Do not change this file.\n";
    game.functions.searchCardsFolder((fullPath, content, file) => {
        fullPath = fullPath.replace(".ts", ".js");

        let relPath = "./" + fullPath.split("cards/")[1];

        //let name = content.match(/ {4}name: ['"`](.*?)['"`],/)?.[1].replace(/\W/g, "_").toLowerCase();
        let name = relPath.slice(2, -3).replace(/\W/g, "_").toLowerCase();
        if (!content.includes("export const blueprint")) return;

        exportContent += `export { blueprint as card_${name} } from "${relPath}";\n`;
    });

    writeFileSync(game.functions.dirname() + "../cards/exports.ts", exportContent);
}

export function reloadCards(path?: string) {
    // TODO: Implement
}