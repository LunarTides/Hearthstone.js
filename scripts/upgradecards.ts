/**
 * Upgrade pre 2.0 cards into 2.0 cards.
 * 
 * @module Upgrade Cards
 */

import fs from "fs";
import { createGame } from "../src/internal.js";

const { game, player1, player2 } = createGame();

function upgradeCard(path: string, data: string, file: fs.Dirent) {
    // TODO: Always add `spellSchool`.
    // TODO: Always add `hpCost`.

    // Yes, this code is ugly. This script is temporary.
    // This will also not work for ALL cards, they are just too flexible.
    // But it should work for all cards that was created using the card creator.
    let filename = file.name;

    game.log(`--- Found ${filename} ---`);

    let hasPassive = data.includes("passive(plr, game, self, key, ");
    let eventValue = hasPassive ? ", EventValue" : "";

    game.log(`Passive: ${hasPassive}`);
    
    let bpDefRegex = /\/\*\*\n \* @type {import\("(?:\.\.\/)+src\/types"\)\.Blueprint}\n \*\//g;
    let kwmRegex = /\n    \/\*\*\n     \* @type {import\("(?:\.\.\/)+src\/types"\)\.KeywordMethod}\n     \*\//g;

    let oldData = data;
    data = data.replaceAll(bpDefRegex, `import { Blueprint${eventValue} } from "@Game/types.js";\n`);
    if (data !== oldData) {
        game.log(`Replaced blueprint type from jsdoc to import.`);
    }

    oldData = data;
    data = data.replaceAll(kwmRegex, ``);
    if (data !== oldData) {
        game.log(`Removed KeywordMethod jsdoc type.`);
    }

    oldData = data;
    data = data.replace(`module.exports = {`, `export const blueprint: Blueprint = {`);
    if (data !== oldData) {
        game.log(`Replaced blueprint definition from module.exports to object.`);
    }

    oldData = data;
    data = data.replace(/&B(.+?)&R/g, `<b>$1</b>`);
    if (data !== oldData) {
        game.log(`Updated tags in description.`);
    }

    oldData = data;
    data = data.replace(/\.maxMana/g, ".emptyMana");
    if (data !== oldData) {
        game.log(`Updated 'maxMana' to 'emptyMana'.`);
    }

    oldData = data;
    data = data.replace(/\.maxMaxMana/g, ".maxMana");
    if (data !== oldData) {
        game.log(`Updated 'maxMaxMana' to 'maxMana'.`);
    }

    oldData = data;
    data = data.replace(/\n {4}set: (.*),/, ``);
    if (data !== oldData) {
        game.log(`Removed the set field.`);
    }

    oldData = data;
    data = data.replace(/ {4}class: (.*),/, `    classes: [$1],`).replace(/classes: \["(.*?) \/ (.*?)"\]/g, 'classes: ["$1", "$2"]');
    if (data !== oldData) {
        game.log(`Updated the class field.`);
    }

    oldData = data;
    data = data.replace(/ {4}spellClass: (.*),/, `    spellSchool: $1,`);
    if (data !== oldData) {
        game.log(`Updated the spellClass field.`);
    }

    oldData = data;
    data = data.replace(/ {4}mana: (.*),/, `    cost: $1,`);
    if (data !== oldData) {
        game.log(`Updated the mana field.`);
    }

    // Replace the card's id with a new one
    data = data.replace(/\n {4}id: (\d+),?/, "");
    let currentId = Number(fs.readFileSync(game.functions.dirname() + "../cards/.latest_id", { encoding: "utf8" })) + 1;

    data = data.replace(/( {4}.+: .+,)(\n\n {4}.*\(plr, game, (self|card))/, `$1\n    id: ${currentId},$2`);
    data = data.replace(/( {4}uncollectible: .*?),?\n\}/, `$1,\n    id: ${currentId},\n}`);
    game.log(`Card was assigned id ${currentId}.`);

    fs.writeFileSync(game.functions.dirname() + "../cards/.latest_id", `${currentId}`);

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

        data = data.replace(/(\n {4}passive\(plr, game, self, key), val\) {/g, `$1, _unknownVal) {
// Only proceed if the correct event key was broadcast
if (!(key === "${key}")) return;

// Here we cast the value to the correct type.
// Do not use the '_unknownVal' variable after this.
const val = _unknownVal as EventValue<typeof key>;
`);

        data = data.replace(keyRegex, "");
        game.log("Updated passive.")
    }

    fs.writeFileSync(path.replace(filename, filename.replace(".js", ".ts")), data);
    
    game.log(`--- Finished ${filename} ---`);
}

function main() {
    game.logError("<yellow>WARNING: This will create new cards with the `.ts` extension, but will leave your old card alone. Please verify that the new cards work before deleting the old ones.</yellow>");

    let proceed = game.input("Do you want to proceed? ([y]es, [n]o): ").toLowerCase()[0] === "y";
    if (!proceed) process.exit(0);

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
