/**
 * Upgrade pre 2.0 cards into 2.0 cards.
 * 
 * @module Upgrade Cards
 */

import { Dirent } from "fs";
import { createGame } from "../src/internal.js";

const { game, player1, player2 } = createGame();

function upgradeField(data: string, oldValue: string | RegExp, newValue: string, toLog: string) {
    let oldData = data;
    data = data.replace(oldValue, newValue);
    if (data !== oldData) {
        game.log(toLog);
    }

    return data;
}

function upgradeCard(path: string, data: string, file: Dirent) {
    // TODO: Always add `spellSchool`.
    // TODO: Always add `hpCost`.

    // Yes, this code is ugly. This script is temporary.
    // This will also not work for ALL cards, they are just too flexible.
    // But it should work for all cards that was created using the card creator.
    let filename = file.name;

    game.log(`--- Found ${filename} ---`);

    let hasPassive = data.includes("passive(plr, self, key, ");
    let eventValue = hasPassive ? ", EventValue" : "";

    game.log(`Passive: ${hasPassive}`);
    
    let bpDefRegex = /\/\*\*\n \* @type {import\("(?:\.\.\/)+src\/types"\)\.Blueprint}\n \*\//g;
    let kwmRegex = /\n    \/\*\*\n     \* @type {import\("(?:\.\.\/)+src\/types"\)\.KeywordMethod}\n     \*\//g;

    data = upgradeField(data, bpDefRegex, `import { Blueprint${eventValue} } from "@Game/types.js";\n`, "Replaced blueprint type from jsdoc to import.");
    data = upgradeField(data, kwmRegex, "", "Removed KeywordMethod jsdoc type.");
    data = upgradeField(data, "module.exports = {", "export const blueprint: Blueprint = {", "Replaced blueprint definition from module.exports to object.");
    data = upgradeField(data, "plr, game, self", "plr, self", "Removed 'game' parameter from abilities.");
    data = upgradeField(data, /&B(.+?)&R/g, "<b>&1</b>", "Updated tags in description.");
    data = upgradeField(data, /\.maxMana/g, ".emptyMana", "Updated 'maxMana' to 'emptyMana'.");
    data = upgradeField(data, /\.maxMaxMana/g, ".maxMana", "Updated 'maxMaxMana' to 'maxMana'.");
    data = upgradeField(data, /\n {4}set: (.*),/, "", "Removed the set field.");
    data = upgradeField(data, / {4}class: (.*),/, "    classes: [$1],", "Updated the class field pt1.");
    data = upgradeField(data, /classes: \["(.*?) \/ (.*?)"\]/g, `classes: ["$1", "$2"]`, "Updated the class field pt2.");
    data = upgradeField(data, / {4}spellClass: (.*),/, "    spellSchool: $1,", "Updated the spellClass field.");
    data = upgradeField(data, / {4}mana: (.*),/, "    cost: $1,", "Updated the mana field.");
    data = upgradeField(data, / {4}desc: (.*),/, "    text: $1,", "Updated the desc field.");
    data = upgradeField(data, / {4}hpDesc: (.*),/, "    hpText: $1,", "Updated the hpDesc field.");

    // Replace the card's id with a new one
    data = upgradeField(data, /\n {4}id: (\d+),?/, "", "Removed id from card.");
    let currentId = Number(game.functions.readFile("/cards/.latestId")) + 1;

    data = upgradeField(data, /( {4}.+: .+,)(\n\n {4}.*\(plr, (self|card))/, `$1\n    id: ${currentId},$2`, `Card was assigned id ${currentId} pt1.`);
    data = upgradeField(data, /( {4}uncollectible: .*?),?\n\}/, `$1,\n    id: ${currentId},\n}`, `Card was assigned id ${currentId} pt2.`);

    game.functions.writeFile("/cards/.latestId", `${currentId}`);

    if (hasPassive) {
        // Find key
        let keyRegex = /\n {8}if \(key [!=]+ "(\w+)"\) /;
        let match = data.match(keyRegex);
        let key = "";
        if (match) {
            key = match[1];
            game.log(`Found key: ${key}.`);
        } else {
            game.logError("<yellow>WARNING: Could not find event key in passive.</yellow>");
        }

        data = upgradeField(data, /(\n {4}passive\(plr, self, key), val\) {/g, `$1, _unknownVal) {
        // Only proceed if the correct event key was broadcast
        if (!(key === "${key}")) return;

        // Here we cast the value to the correct type.
        // Do not use the '_unknownVal' variable after this.
        const val = _unknownVal as EventValue<typeof key>;
`, "Updated passive.");

        data = upgradeField(data, keyRegex, "", "Removed key from passive.");
    }

    // Replace .js to .ts
    path = path.replace(filename, filename.replace(".js", ".ts"));
    game.functions.writeFile(path, data);
    
    game.log(`--- Finished ${filename} ---`);
}

function main() {
    game.logError("<yellow>WARNING: This will create new cards with the `.ts` extension, but will leave your old cards alone. Please verify that the new cards work before deleting the old ones.</yellow>");

    let proceed = game.input("Do you want to proceed? ([y]es, [n]o): ").toLowerCase()[0] === "y";
    if (!proceed) process.exit(0);

    // Update card extensions
    game.functions.searchCardsFolder((fullPath, content) => {
        game.functions.writeFile(fullPath.replace(".mts", ".ts"), content);
        game.functions.deleteFile(fullPath);

        game.log(`Updated extension for card ${fullPath.slice(0, -4)}[.mts -> .ts]`);
    }, undefined, ".mts");

    // Upgrade all cards
    game.functions.searchCardsFolder(upgradeCard, undefined, ".js");

    // Remove the dist folder
    if (process.platform === "win32") {
        game.functions.runCommand("rmdir /S /Q dist > NUL 2>&1");
    } else {
        game.functions.runCommand("rm -rf ./dist/ > /dev/null 2>&1");
    }

    game.log("Trying to compile...");
    try {
        let error = game.functions.runCommand("npx tsc");
        if (error instanceof Error) throw error;

        game.log("<bright:green>Success!</bright:green>");
    } catch (err) {
        // If the error code is 2, warn the user.
        if (err.status === 2) {
            game.logError("<yellow>WARNING: Compiler error occurred. Please fix the errors in the card.</yellow>");
        } else {
            throw err;
        }
    }

    game.log("Done");
}

main();
