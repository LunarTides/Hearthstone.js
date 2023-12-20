/**
 * Upgrade pre 2.0 cards into 2.0 cards.
 *
 * @module Upgrade Cards
 */

import process from 'node:process';
import { createGame } from '../src/internal.js';

const { game } = createGame();

/**
 * Replaces occurrences of `oldValue` in `data` with `newValue` and logs a message if the data is modified.
 *
 * @param data The original string data.
 * @param oldValue The value or regular expression to replace.
 * @param newValue The new value to replace the old value with.
 * @param toLog The message to log if the data is modified.
 *
 * @returns The modified string data.
 */
function upgradeField(data: string, oldValue: string | RegExp, newValue: string, toLog: string): string {
    const oldData = data;
    data = data.replace(oldValue, newValue);
    if (data !== oldData) {
        console.log(toLog);
    }

    return data;
}

/**
 * Upgrades a card with the given path, data, and file to 2.0.
 *
 * @param path The path of the card.
 * @param data The data of the card.
 * @param file The file of the card.
 */
function upgradeCard(path: string, data: string, file: any): void {
    // TODO: Split stats into attack and health
    // TODO: uncollectible -> collectible

    // Yes, this code is ugly. This script is temporary.
    // This will also not work for ALL cards, they are just too flexible.
    // But it should work for all cards that was created using the card creator.
    const fileName = file.name as string;

    console.log(`--- Found ${fileName} ---`);

    const hasPassive = data.includes('passive(plr, self, key, ');
    const eventValue = hasPassive ? ', EventValue' : '';

    console.log(`Passive: ${hasPassive}`);

    const blueprintDefinitionRegex = /\/\*\*\n \* @type {import\("(?:\.\.\/)+src\/types"\)\.Blueprint}\n \*\//g;
    const abilityDefinitionRegex = /\n {4}\/\*{2}\n {5}\* @type {import\("(?:\.{2}\/)+src\/types"\)\.KeywordMethod}\n {5}\*\//g;

    data = upgradeField(data, blueprintDefinitionRegex, `import { type Blueprint${eventValue} } from '@Game/types.js';\n`, 'Replaced blueprint type from jsdoc to import.');
    data = upgradeField(data, abilityDefinitionRegex, '', 'Removed KeywordMethod jsdoc type.');
    data = upgradeField(data, 'module.exports = {', 'export const blueprint: Blueprint = {', 'Replaced blueprint definition from module.exports to object.');
    data = upgradeField(data, /plr, game, self/g, 'plr, self', 'Removed \'game\' parameter from abilities.');
    data = upgradeField(data, /&B(.+?)&R/g, '<b>$1</b>', 'Updated tags in description.');
    data = upgradeField(data, /\.maxMana/g, '.emptyMana', 'Updated \'maxMana\' to \'emptyMana\'.');
    data = upgradeField(data, /\.maxMaxMana/g, '.maxMana', 'Updated \'maxMaxMana\' to \'maxMana\'.');
    data = upgradeField(data, /\n {4}set: (.*),/, '', 'Removed the set field.');
    data = upgradeField(data, / {4}class: (.*),/, '    classes: [$1],', 'Updated the class field pt1.');
    data = upgradeField(data, /classes: \["(.*?) \/ (.*?)"]/g, 'classes: [\'$1\', \'$2\']', 'Updated the class field pt2.');
    data = upgradeField(data, / {4}spellClass: (.*),/, '    spellSchool: $1,', 'Updated the spellClass field.');
    data = upgradeField(data, / {4}mana: (.*),/, '    cost: $1,', 'Updated the mana field.');
    data = upgradeField(data, / {4}desc: (.*),/, '    text: $1,', 'Updated the desc field.');
    data = upgradeField(data, / {4}hpDesc: (.*),/, '    hpText: $1,', 'Updated the hpDesc field.');
    data = upgradeField(data, / {4}gainEmptyMana: (.*),/, '    addEmptyMana: $1,', 'Updated gainEmptyMana.');
    data = upgradeField(data, / {4}gainMana: (.*),/, '    addMana: $1,', 'Updated gainMana.');
    data = upgradeField(data, / {4}gainOverload: (.*),/, '    addOverload: $1,', 'Updated gainOverload.');
    data = upgradeField(data, /( {4}type: .*,)/, '$1\n    spellSchool: \'None\',', 'Added spellSchool.');
    data = upgradeField(data, /( {4}hpDesc: .*,)/, '$1\n    hpCost: 2,', 'Added hpCost.');

    // Replace the card's id with a new one
    data = upgradeField(data, /\n {4}id: (\d+),?/, '', 'Removed id from card.');
    const currentId = Number(game.functions.util.fs('read', '/cards/.latestId')) + 1;

    data = upgradeField(data, /( {4}.+: .+,)(\n\n {4}.*\(plr, (self|card))/, `$1\n    id: ${currentId},$2`, `Card was assigned id ${currentId} pt1.`);
    data = upgradeField(data, /( {4}uncollectible: .*?),?\n}/, `$1,\n    id: ${currentId},\n}`, `Card was assigned id ${currentId} pt2.`);

    game.functions.util.fs('write', '/cards/.latestId', `${currentId}`);

    if (hasPassive) {
        // Find key
        const keyRegex = /\n {8}if \(key [!=]+ "(\w+)"\) /;
        const match = keyRegex.exec(data);
        let key = '';
        if (match) {
            key = match[1];
            console.log(`Found key: ${key}.`);
        } else {
            console.error('<yellow>WARNING: Could not find event key in passive.</yellow>');
        }

        data = upgradeField(data, /(\n {4}passive\(plr, self, key), val\) {/g, `$1, _unknownVal) {
        // Only proceed if the correct event key was broadcast
        if (key !== '${key}') return;

        // Here we cast the value to the correct type.
        // Do not use the '_unknownValue' variable after this.
        const value = _unknownValue as EventValue<typeof key>;
`, 'Updated passive.');

        data = upgradeField(data, keyRegex, '', 'Removed key from passive.');
    }

    data = data.replaceAll('"', '\'');

    // Replace .js to .ts
    path = path.replace(fileName, fileName.replaceAll('_', '-').replace('.js', '.ts'));
    game.functions.util.fs('write', path, data);

    console.log(`--- Finished ${fileName} ---`);
}

/**
 * The main function of the program.
 */
function main(): void {
    console.warn('<yellow>WARNING: This will create new cards with the `.ts` extension, but will leave your old cards alone. Please verify that the new cards work before deleting the old ones.</yellow>');
    console.warn('<yellow>WARNING: This script is outdated and might not perfectly upgrade cards. Treat this script as being deprecated. I won\'t remove it yet since it might still be useful, but I don\'t guarantee that it works.</yellow>');

    const proceed = game.input('Do you want to proceed? ([y]es, [n]o): ').toLowerCase().startsWith('y');
    if (!proceed) {
        process.exit(0);
    }

    // Update card extensions
    game.functions.util.searchCardsFolder((fullPath, content) => {
        game.functions.util.fs('write', fullPath.replace('.mts', '.ts'), content);
        game.functions.util.fs('rm', fullPath);

        console.log(`Updated extension for card ${fullPath.slice(0, -4)}[.mts -> .ts]`);
    }, undefined, '.mts');

    // Upgrade all cards
    game.functions.util.searchCardsFolder(upgradeCard, undefined, '.js');
    game.functions.card.generateExports();

    // Remove the dist folder
    game.functions.util.fs('rm', '/dist', { recursive: true, force: true });

    console.log('Trying to compile...');

    if (game.functions.util.tryCompile()) {
        console.log('<bright:green>Success!</bright:green>');
    } else {
        console.error('<yellow>WARNING: Compiler error occurred. Please fix the errors in the card.</yellow>');
    }

    console.log('Done');
}

main();
