import chalk from "chalk";
import { CardRarity } from "@Game/types.js";

export const colorFunctions = {
    /**
     * Colors `str` based on `rarity`.
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
     * const colored = fromRarity(card.name, card.rarity);
     * assert.equal(colored, chalk.yellow("Sheep"));
     */
    fromRarity(str: string, rarity: CardRarity): string {
        switch (rarity) {
            case "Common":
                str = `<gray>${str}</gray>`;
                break;
            case "Rare":
                str = `<blue>${str}</blue>`;
                break;
            case "Epic":
                str = `<bright:magenta>${str}</bright:magenta>`;
                break;
            case "Legendary":
                str = `<yellow>${str}</yellow>`;
                break;
            default:
                break;
        }

        return this.fromTags(str);
    },

    /**
     * Parses color tags in `str`.
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
     * '[fg:]red', '[fg:]green', '[fg:]blue' // (The `fg` is optional. For example: `fg:blue`)
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
     * 'b[old]', 'italic', 'underline' // The `old` in bold is optional
     * 
     * // Hex
     * '[fg:]#FF0000', 'bg:#FF0000'
     * 
     * // RGB
     * '[fg:]rgb[:][(]255[ ],0[ ],0[)]', 'bg:rgb:255,0,0' // E.g. rgb:(0, 0, 255). rgb:0,0,255). rgb:(0,0,255). rgb(0, 0, 255). bg:rgb(0, 0, 255)
     *
     * @param str The string to parse
     *
     * @returns The resulting string
     * 
     * @example
     * const parsed = fromTags("<b>Battlecry:</b> Test");
     * assert.equal(parsed, chalk.bold("Battlecry:") + " Test");
     * 
     * @example
     * // Add the `~` character to escape the tag
     * const parsed = fromTags("~<b>Battlecry:~</b> Test ~~<b>Test~~</b> Test");
     * assert.equal(parsed, "<b>Battlecry:</b> Test ~" + chalk.bold("Test~") + " Test");
     * 
     * @example
     * // You can mix and match tags as much as you want. You can remove categories of tags as well, for example, removing `bg:bright:blue` by doing `</bg>`
     * const parsed = fromTags("<red bg:bright:blue bold>Test</bg> Hi</b> there</red> again");
     * assert.equal(parsed, chalk.red.bgBlueBright.bold("Test") + chalk.red.bold(" Hi") + chalk.red(" there") + " again");
     * 
     * @example
     * // Try to not use '</>' if you can help it. In this case, it is fine.
     * const parsed = fromTags("<fg:red italic bg:#0000FF>Test</> Another test");
     * assert.equal(parsed, chalk.red.italic("Test") + " Another test");
     */
    fromTags(str: string): string {
        // TODO: Optimize perhaps

        /**
         * Appends text styling based on the current types.
         *
         * @param c The text to be styled
         * @return The text with applied styling
         */
        const appendTypes = (c: string): string => {
            let ret = c;

            // This line fixes a bug that makes, for example, `</b>Test</b>.` make the `.` be red when it should be white. This bug is why all new battlecries were `<b>Battlecry:</b> Deal...` instead of `<b>Battlecry: </b>Deal...`. I will see which one i choose in the future.
            // Update: I discourge the use of `reset` now that you cancel tags manually. Use `</>` instead.
            if (currentTypes.includes("reset")) currentTypes = ["reset"]; 

            const readNextType = (index: number): string => {
                if (index >= currentTypes.length - 1) return "";

                return currentTypes[index + 1];
            };

            const partOfRGB: number[] = [];
            currentTypes.reverse().forEach((t, index) => {
                // The type is part of an rgb value. Ignore it
                if (partOfRGB.includes(index)) return;

                t = t.toLowerCase();

                // Support for rgb values with spaces after the commas
                if (t.endsWith(")") && /rgb:?\(/.test(readNextType(index + 1))) {
                    t = readNextType(index + 1) + readNextType(index) + t;
                    partOfRGB.push(index + 1, index + 2);
                }

                // Remove `fg:` prefix
                if (t.startsWith("fg:")) {
                    t = t.replace("fg:", "");
                }

                // Remove the `bg:` prefix
                let bg = false;
                if (t.startsWith("bg:")) {
                    t = t.replace("bg:", "");
                    bg = true;
                }

                // Hex
                if (t.startsWith("#")) {
                    t = t.slice(1);

                    if (bg) {
                        ret = chalk.bgHex(t)(ret);
                        return;
                    }
                    ret = chalk.hex(t)(ret);
                    return;
                }

                // RGB
                if (t.startsWith("rgb")) {
                    t = t.replace(/rgb:?/, "");
                    const [r, g, b] = t.split(",").map(s => parseInt(s.replace(/[()]/, "")));

                    if (bg) {
                        ret = chalk.bgRgb(r, g, b)(ret);
                        return;
                    }
                    ret = chalk.rgb(r, g, b)(ret);
                    return;
                }

                // Here are ALL of the color tags
                switch (t) {
                    case "red":
                        if (bg) ret = chalk.bgRed(ret);
                        else ret = chalk.red(ret);
                        break;
                    case "green":
                        if (bg) ret = chalk.bgGreen(ret);
                        else ret = chalk.green(ret);
                        break;
                    case "blue":
                        if (bg) ret = chalk.bgBlue(ret);
                        else ret = chalk.blue(ret);
                        break;
                    case "cyan":
                        if (bg) ret = chalk.bgCyan(ret);
                        else ret = chalk.cyan(ret);
                        break;
                    case "magenta":
                        if (bg) ret = chalk.bgMagenta(ret);
                        else ret = chalk.magenta(ret);
                        break;
                    case "yellow":
                        if (bg) ret = chalk.bgYellow(ret);
                        else ret = chalk.yellow(ret);
                        break;
                    case "black":
                        if (bg) ret = chalk.bgBlack(ret);
                        else ret = chalk.black(ret);
                        break;
                    case "white":
                        if (bg) ret = chalk.bgWhite(ret);
                        else ret = chalk.white(ret);
                        break;
                    // Accept both "gray" and "grey"
                    case "grey":
                    case "gray":
                        if (bg) ret = chalk.bgGray(ret);
                        else ret = chalk.gray(ret);
                        break;

                    case "bright:red":
                        if (bg) ret = chalk.bgRedBright(ret);
                        else ret = chalk.redBright(ret);
                        break;
                    case "bright:green":
                        if (bg) ret = chalk.bgGreenBright(ret);
                        else ret = chalk.greenBright(ret);
                        break;
                    case "bright:blue":
                        if (bg) ret = chalk.bgBlueBright(ret);
                        else ret = chalk.blueBright(ret);
                        break;
                    case "bright:cyan":
                        if (bg) ret = chalk.bgCyanBright(ret);
                        else ret = chalk.cyanBright(ret);
                        break;
                    case "bright:magenta":
                        if (bg) ret = chalk.bgMagentaBright(ret);
                        else ret = chalk.magentaBright(ret);
                        break;
                    case "bright:yellow":
                        if (bg) ret = chalk.bgYellowBright(ret);
                        else ret = chalk.yellowBright(ret);
                        break;
                    case "bright:black":
                        if (bg) ret = chalk.bgBlackBright(ret);
                        else ret = chalk.blackBright(ret);
                        break;
                    case "bright:white":
                        if (bg) ret = chalk.bgWhiteBright(ret);
                        else ret = chalk.whiteBright(ret);
                        break;
                    
                    case "reset":
                        currentTypes = [];

                        ret = chalk.reset(ret);
                        break;
                    // You can use `b` instead of `bold`
                    case "b":
                    case "bold":
                        ret = chalk.bold(ret);
                        break;
                    case "italic":
                        ret = chalk.italic(ret);
                        break;
                    case "underline":
                        ret = chalk.underline(ret);
                        break;
                    case "overline":
                        ret = chalk.overline(ret);
                        break
                    case "strikethrough":
                        ret = chalk.strikethrough(ret);
                        break;
                    case "dim":
                        ret = chalk.dim(ret);
                        break;
                    case "inverse":
                        ret = chalk.inverse(ret);
                        break;
                    case "hidden":
                        ret = chalk.hidden(ret);
                        break;
                    case "visible":
                        ret = chalk.visible(ret);
                        break;
                }
            });

            return ret;
        }

        // Don't waste resources if the string doesn't contain tags
        if (!str.includes("<") || !str.includes(">")) return str;

        let strbuilder = "";
        let wordStringbuilder = "";
        let currentTypes: string[] = [];

        let tagbuilder = "";
        let readingTag = false;
        let removeTag = false;

        const readPrevious = (i: number) => {
            if (i <= 0) return "";

            return str[i - 1];
        }

        const readNext = (i: number) => {
            if (i >= str.length - 1) return "";

            return str[i + 1];
        }

        const cancelled = (i: number): boolean => {
            const one = readPrevious(i);
            const two = readPrevious(i - 1);

            if (two === "~") return false;
            return one === "~";
        }

        // Loop through the characters in str
        str.split("").forEach((c, i) => {
            if (cancelled(i)) {
                wordStringbuilder += c;
                return;
            }

            if (c === "~") return;
            if (c === "<" && !readingTag) {
                // Start a new tag
                strbuilder += appendTypes(wordStringbuilder);
                wordStringbuilder = "";

                readingTag = true;
                return;
            }
            if (c === ">" && readingTag) {
                // End tag reading
                readingTag = false;

                const currentTags = tagbuilder.split(" ");
                tagbuilder = "";

                if (!removeTag) currentTypes.push(...currentTags);
                else {
                    removeTag = false;

                    // If the tag is </>, remove all tags
                    if (readPrevious(i) === "/") {
                        currentTypes = [];
                        return;
                    };

                    currentTags.forEach(tag => {
                        currentTypes = currentTypes.filter(type => !type.startsWith(tag));
                    });
                }

                return;
            }
            if (c === "/" && readingTag) {
                if (readPrevious(i) === "<") {
                    removeTag = true;
                    return;
                }
                if (readNext(i) === ">") return;
            }

            if (readingTag) {
                tagbuilder += c;
                return;
            }

            wordStringbuilder += c;
        });

        strbuilder += appendTypes(wordStringbuilder);

        return strbuilder;
    },

    /**
     * Removes color tags from a string. Look in `parseTags` for more information.
     * 
     * This only removes the TAGS, not the actual colors.
     * 
     * @example
     * const str = "<b>Hello</b>";
     * 
     * assert.equal(stripTags(str), "Hello");
     */
    stripTags(str: string): string {
        // Regular expressions created by AI's, it removes the "<b>"'s but keeps the "~<b>"'s since the '~' here works like an escape character.
        // It does however remove the escape character itself.
        let strippedString = str;

        // Remove unescaped tags
        strippedString = strippedString.replace(/(?<!~)<.+?>/g, "")

        // Remove escape character
        strippedString = strippedString.replace(/~(<.+?>)/g, "$1")

        return strippedString;
    },
}
