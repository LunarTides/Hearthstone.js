import * as cards from "../../cards/exports.js";
import { createHash } from "crypto";
import { writeFileSync } from "fs";

export function doImportCards() {
    game.cards = Object.values(cards);
}

export function generateCardExports() {
    let exportContent = "// This file has been automatically created. Do not change this file.\n";
    game.functions.searchCardsFolder((fullPath, content, file) => {
        fullPath = fullPath.replace(".mts", ".mjs");

        let relPath = "./" + fullPath.split("cards/")[1];

        let hash = createHash("sha256").update(content, "utf8").digest("hex").slice(0, 7);
        exportContent += `export { blueprint as card_${hash} } from "${relPath}";\n`;
    });

    writeFileSync(game.functions.dirname() + "../cards/exports.ts", exportContent);
}

export function reloadCards(path?: string) {
    // TODO: Implement
}