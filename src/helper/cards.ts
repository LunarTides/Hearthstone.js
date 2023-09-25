import { Blueprint } from "@Game/types.js";
import * as cards from "../../cards/exports.js"
import { createHash } from "crypto";

export function doImportCards() {
    game.cards = Object.values(cards) as Blueprint[];
}

export function generateCardExports() {
    let exportContent = "// This file has been automatically created. Do not change this file.\n";
    game.functions.searchCardsFolder((fullPath, content, file) => {
        if (!content.includes("export const blueprint")) return;

        fullPath = fullPath.replace(".ts", ".js");
        let relPath = "./" + fullPath.split("cards/")[1];

        let hash = createHash("sha256").update(relPath).digest("hex").toString().slice(0, 7);

        exportContent += `export { blueprint as c${hash} } from "${relPath}";\n`;
    });

    game.functions.writeFile("/cards/exports.ts", exportContent);
}

export function reloadCards(path?: string) {
    // TODO: Implement
}