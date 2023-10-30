import chalk, { type ChalkInstance } from 'chalk';
import stripAnsi from 'strip-ansi';
import { type CardRarity } from '@Game/types.js';

export const COLOR_FUNCTIONS = {
    parseTags: true,

    /**
     * Colors `text` based on `rarity`.
     *
     * @param str The string to color
     * @param rarity The rarity
     *
     * @returns The colored string
     *
     * @example
     * assert(card.rarity, "Legendary");
     * assert(card.name, "Sheep");
     *
     * const COLORED = fromRarity(card.name, card.rarity);
     * assert.equal(COLORED, chalk.yellow("Sheep"));
     */
    fromRarity(text: string, rarity: CardRarity): string {
        switch (rarity) {
            case 'Free': {
                break;
            }

            case 'Common': {
                text = `<gray>${text}</gray>`;
                break;
            }

            case 'Rare': {
                text = `<blue>${text}</blue>`;
                break;
            }

            case 'Epic': {
                text = `<bright:magenta>${text}</bright:magenta>`;
                break;
            }

            case 'Legendary': {
                text = `<yellow>${text}</yellow>`;
                break;
            }

            default: {
                throw new Error('Unknown rarity');
            }
        }

        return this.fromTags(text);
    },

    /**
     * Parses color tags in `text`.
     *
     * Look at the examples for some of the things you can do.
     *
     * Here are _some_ of the available tags:
     *
     * @example
     * // You can combined these with each other
     * // Many of these tags may not be supported by all terminal emulators / consoles.
     * // The following terminals are tested:
     * // Windows Terminal
     * // Windows Command Prompt (doesn't support overline)
     * // Windows Powershell (doesn't support overline)
     *
     * // Foreground
     * '[fg:][dark:]red', '[fg:][dark:]green', '[fg:][dark:]blue' // (The `fg` and `dark` are both optional. For example: `fg:blue`)
     *
     * // Background
     * 'bg:red', 'bg:green', 'bg:blue'
     *
     * // Bright
     * 'bright:red', 'bright:green', 'bright:blue'
     *
     * // Background Bright
     * 'bg:bright:red', 'bg:bright:green', 'bg:bright:blue'
     *
     * // Special
     * 'b[old]', 'i[talic]', 'underline' // The `old` in bold and `talic` in italic are optional
     *
     * // Hex
     * '[fg:]#FF0000', 'bg:#FF0000'
     *
     * // RGB
     * '[fg:]rgb[:][(]255[ ],0[ ],0[)]', 'bg:rgb(255, 0, 0)' // E.g. rgb:(0, 0, 255). rgb:0,0,255). rgb:(0,0,255). rgb(0, 0, 255). bg:rgb(0, 0, 255)
     *
     * @param text The text to parse
     *
     * @returns The resulting string
     *
     * @example
     * const PARSED = fromTags("<b>Battlecry:</b> Test");
     * assert.equal(PARSED, chalk.bold("Battlecry:") + " Test");
     *
     * @example
     * // Add the `~` character to escape the tag
     * const PARSED = fromTags("~<b>Battlecry:~</b> Test ~~<b>Test~~</b> Test");
     * assert.equal(PARSED, "<b>Battlecry:</b> Test ~" + chalk.bold("Test~") + " Test");
     *
     * @example
     * // You can mix and match tags as much as you want. You can remove categories of tags as well, for example, removing `bg:bright:blue` by doing `</bg>`
     * const PARSED = fromTags("<red bg:bright:blue bold>Test</bg> Hi</b> there</red> again");
     * assert.equal(PARSED, chalk.red.bgBlueBright.bold("Test") + chalk.red.bold(" Hi") + chalk.red(" there") + " again");
     *
     * @example
     * // Try to not use '</>' if you can help it. In this case, it is fine.
     * const PARSED = fromTags("<fg:red italic bg:#0000FF>Test</> Another test");
     * assert.equal(PARSED, chalk.red.italic.bgHex("#0000FF")("Test") + " Another test");
     */
    fromTags(text: string): string {
        // TODO: Optimize perhaps. #333
        if (!this.parseTags) {
            return text;
        }

        const PART_OF_RGB: number[] = [];

        const handleSpecialTags = (index: number, tag: string, returnValue: string, bg: boolean): string => {
            const readNextType = (index: number): string => {
                if (index >= currentTypes.length - 1) {
                    return '';
                }

                return currentTypes[index + 1];
            };

            // The type is part of an rgb value. Ignore it
            if (PART_OF_RGB.includes(index)) {
                return returnValue;
            }

            tag = tag.toLowerCase();

            // Support for rgb values with spaces after the commas
            if (tag.endsWith(')') && /rgb:?\(/.test(readNextType(index + 1))) {
                tag = readNextType(index + 1) + readNextType(index) + tag;
                PART_OF_RGB.push(index + 1, index + 2);
            }

            // Hex
            if (tag.startsWith('#')) {
                if (bg) {
                    return chalk.bgHex(tag)(returnValue);
                }

                return chalk.hex(tag)(returnValue);
            }

            // RGB
            if (tag.startsWith('rgb')) {
                tag = tag.replace(/rgb:?/, '');
                const [RED, GREEN, BLUE] = tag.split(',').map(s => game.lodash.parseInt(s.replace(/[()]/, '')));

                if (bg) {
                    return chalk.bgRgb(RED, GREEN, BLUE)(returnValue);
                }

                return chalk.rgb(RED, GREEN, BLUE)(returnValue);
            }

            return returnValue;
        };

        const applyColorFromTag = (index: number, tag: string, returnValue: string): string => {
            // Remove `fg:` prefix
            if (tag.startsWith('fg:')) {
                tag = tag.replace('fg:', '');
            }

            // Remove the `bg:` prefix
            let bg = false;
            if (tag.startsWith('bg:')) {
                tag = tag.replace('bg:', '');
                bg = true;
            }

            // Remove the `bright:` prefix
            let bright = false;
            if (tag.startsWith('bright:')) {
                tag = tag.replace('bright:', '');
                bright = true;
            }

            // Remove `dark:` prefix
            if (tag.startsWith('dark:')) {
                tag = tag.replace('dark:', '');
            }

            returnValue = handleSpecialTags(index, tag, returnValue, bg);

            // Here are the non-special color tags
            if (tag === 'reset') {
                currentTypes = [];
            }

            if (tag === 'b') {
                tag = 'bold';
            } else if (tag === 'i') {
                tag = 'italic';
            }

            let tagFuncString = bg ? 'bg' + game.lodash.capitalize(tag) : tag;
            tagFuncString = bright ? tagFuncString + 'Bright' : tagFuncString;

            const CALLBACK = chalk[tagFuncString as keyof ChalkInstance] as unknown;
            if (CALLBACK instanceof Function) {
                returnValue = (CALLBACK as (...text: any) => string)(returnValue);
            } else {
                throw new TypeError(`"${tag}" is not a valid color tag. "${tag}" results in 'chalk.${tagFuncString}' which is not a function.`);
            }

            return returnValue;
        };

        /**
         * Appends text styling based on the current types.
         *
         * @param c The text to be styled
         * @returns The text with applied styling
         */
        const appendTypes = (c: string): string => {
            let returnValue = c;

            // This line fixes a bug that makes, for example, `</b>Test</b>.` make the `.` be red when it should be white. This bug is why all new battlecries were `<b>Battlecry:</b> Deal...` instead of `<b>Battlecry: </b>Deal...`. I will see which one i choose in the future.
            // Update: I discourge the use of `reset` now that you cancel tags manually. Use `</>` instead.
            if (currentTypes.includes('reset')) {
                currentTypes = ['reset'];
            }

            for (const [INDEX, TAG] of currentTypes.reverse().entries()) {
                returnValue = applyColorFromTag(INDEX, TAG, returnValue);
            }

            return returnValue;
        };

        // Don't waste resources if the string doesn't contain tags
        if (!text.includes('<') || !text.includes('>')) {
            return text;
        }

        let strbuilder = '';
        let wordStringbuilder = '';
        let currentTypes: string[] = [];

        let tagbuilder = '';
        let readingTag = false;
        let removeTag = false;

        const readPrevious = (i: number) => {
            if (i <= 0) {
                return '';
            }

            return text[i - 1];
        };

        const cancelled = (i: number): boolean => {
            const ONE = readPrevious(i);
            const TWO = readPrevious(i - 1);

            if (TWO === '~') {
                return false;
            }

            return ONE === '~';
        };

        // Loop through the characters in str
        for (const [INDEX, CHARACTER] of [...text].entries()) {
            if (cancelled(INDEX)) {
                wordStringbuilder += CHARACTER;
                continue;
            }

            if (CHARACTER === '~') {
                continue;
            }

            if (CHARACTER === '<' && !readingTag) {
                // Start a new tag
                strbuilder += appendTypes(wordStringbuilder);
                wordStringbuilder = '';

                readingTag = true;
            } else if (CHARACTER === '>' && readingTag) {
                // End tag reading
                readingTag = false;

                const CURRENT_TAGS = tagbuilder.split(' ');
                tagbuilder = '';

                if (!removeTag) {
                    currentTypes.push(...CURRENT_TAGS);
                    continue;
                }

                // Remove the tags
                removeTag = false;

                // If the tag is </>, remove all tags
                if (readPrevious(INDEX) === '/') {
                    currentTypes = [];
                    continue;
                }

                for (const TAG of CURRENT_TAGS) {
                    const SUCCESS = game.functions.util.remove(currentTypes, TAG);
                    if (SUCCESS) {
                        continue;
                    }

                    currentTypes = currentTypes.filter(type => !type.startsWith(TAG));
                }
            } else if (CHARACTER === '/' && readingTag && readPrevious(INDEX) === '<') {
                removeTag = true;
            } else if (readingTag) {
                tagbuilder += CHARACTER;
                continue;
            } else {
                wordStringbuilder += CHARACTER;
            }
        }

        strbuilder += appendTypes(wordStringbuilder);

        return strbuilder;
    },

    /**
     * Generates a colored text based on a condition.
     *
     * @param condition Determines whether to apply the color.
     * @param color The color to apply to the text.
     * @param text The text to be colored.
     */
    if(condition: boolean, color: string, text: string) {
        return condition ? `<${color}>${text}</${color}>` : `<gray>${text}</gray>`;
    },

    /**
     * Removes color tags from a string. Look in `parseTags` for more information.
     *
     * This only removes the TAGS, not the actual colors.
     *
     * @example
     * const STR = "<b>Hello</b>";
     *
     * assert.equal(stripTags(STR), "Hello");
     */
    stripTags(text: string): string {
        // Regular expressions created by AIs, it removes the "<b>"'s but keeps the "~<b>"'s since the '~' here works like an escape character.
        // It does however remove the escape character itself.
        // Remove unescaped tags
        text = text.replaceAll(/(?<!~)<.+?>/g, '');

        // Remove escape character
        text = text.replaceAll(/~(<.+?>)/g, '$1');

        return text;
    },

    /**
     * Removes ansi color codes from a string.
     */
    stripColors(text: string): string {
        return stripAnsi(text);
    },

    /**
     * Removes both color tags and ansi codes from a string.
     */
    stripAll(text: string): string {
        return this.stripColors(this.stripTags(text));
    },
};
