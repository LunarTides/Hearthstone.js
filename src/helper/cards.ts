import { Blueprint } from "@Game/types.js";
import * as cards from "../../cards/exports.js"
import { createHash } from "crypto";

export function doImportCards() {
    game.blueprints = Object.values(cards) as Blueprint[];
}

export function generateCardExports() {
    let exportContent = "// This file has been automatically created. Do not change this file.\n";

    const list: string[] = [];
    game.functions.file.directory.searchCards((fullPath, content, file) => {
        if (!content.includes("export const blueprint")) return;

        fullPath = fullPath.replace(".ts", ".js");
        const relPath = "./" + fullPath.split("cards/")[1];

        list.push(relPath);
    });

    // Sort the list alphabetically so it will remain constant between different file system formats.
    list.sort().forEach(path => {
        const hash = createHash("sha256").update(path).digest("hex").toString().slice(0, 7);

        exportContent += `export { blueprint as c${hash} } from "${path}";\n`;
    });

    game.functions.file.write("/cards/exports.ts", exportContent);
    game.functions.file.write("/dist/cards/exports.js", exportContent);
}

export function reloadCards(path?: string) {
    // TODO: Implement. #323
}
