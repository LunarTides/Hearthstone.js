import { Blueprint } from "@Game/types.js";
import * as cards from "../../cards/exports.js"
import { createHash } from "crypto";

export function doImportCards() {
    game.cards = Object.values(cards) as Blueprint[];
}

export function generateCardExports() {
    let exportContent = "// This file has been automatically created. Do not change this file.\n";

    let list: string[] = [];
    game.functions.searchCardsFolder((fullPath, content, file) => {
        if (!content.includes("export const blueprint")) return;

        fullPath = fullPath.replace(".ts", ".js");
        let relPath = "./" + fullPath.split("cards/")[1];

        list.push(relPath);
    });

    // Sort the list alphabetically so it will remain constant between different file system formats.
    list.sort().forEach(path => {
        let hash = createHash("sha256").update(path).digest("hex").toString().slice(0, 7);

        exportContent += `export { blueprint as c${hash} } from "${path}";\n`;
    });

    game.functions.writeFile("/cards/exports.ts", exportContent);
    game.functions.writeFile("/dist/cards/exports.js", exportContent);
}

export function reloadCards(path?: string) {
    // TODO: Implement
}