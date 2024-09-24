import type { CardRarity } from "@Game/types.js";
import chalk, { type ChalkInstance } from "chalk";
import stripAnsi from "strip-ansi";

export const colorFunctions = {
	/**
	 * If it should parse color tags (`<b>`)
	 */
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
	 * const colored = fromRarity(card.name, card.rarity);
	 * assert.equal(colored, chalk.yellow("Sheep"));
	 */
	fromRarity(text: string, rarity: CardRarity): string {
		let newText = "";

		switch (rarity) {
			case "Free": {
				newText = text;
				break;
			}

			case "Common": {
				newText = `<gray>${text}</gray>`;
				break;
			}

			case "Rare": {
				newText = `<blue>${text}</blue>`;
				break;
			}

			case "Epic": {
				newText = `<bright:magenta>${text}</bright:magenta>`;
				break;
			}

			case "Legendary": {
				newText = `<yellow>${text}</yellow>`;
				break;
			}

			default: {
				throw new Error("Unknown rarity");
			}
		}

		return this.fromTags(newText);
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
	 * @param text The text to parse
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
	 * assert.equal(parsed, chalk.red.italic.bgHex("#0000FF")("Test") + " Another test");
	 */
	fromTags(text: string): string {
		if (!this.parseTags || !text.includes("<")) {
			return text;
		}

		let result = "";
		let currentTags: string[] = [];

		for (const match of text.matchAll(/(.*?)(<.*?>|$)/gs)) {
			let [_, content = "", tag = ""] = match;

			[content, tag] = this._handleTildeCase(text, match, content, tag);

			if (content) {
				result += this._applyChalk(content, currentTags);
			}

			if (tag?.startsWith("<")) {
				const tags = tag.split(" ");

				for (const individualTag of tags) {
					if (individualTag.startsWith("</")) {
						const tagName = individualTag.slice(2, -1); // Remove '</' and '>'
						currentTags = currentTags.filter((t) => !t.startsWith(tagName));
					} else {
						currentTags.push(individualTag.replace(/[<>]/g, "")); // Remove < and >
					}
				}
			}
		}

		return result;
	},

	_applyChalk(text: string, tags: string[]): string {
		return tags.reduce((styledText, _tag) => {
			let tag = _tag;

			const isBackground = tag.startsWith("bg:");
			const isBright = tag.startsWith("bright:");

			// Clean up the tag and handle specific cases
			tag = tag.replace(/fg:|bg:|bright:|dark:/g, "");
			if (tag === "b") tag = "bold";
			if (tag === "i") tag = "italic";

			// Hex color support
			if (tag.startsWith("#")) {
				return isBackground
					? chalk.bgHex(tag)(styledText)
					: chalk.hex(tag)(styledText);
			}

			// Format chalk method
			let chalkMethod = isBackground ? `bg${game.lodash.capitalize(tag)}` : tag;

			if (isBright) chalkMethod += "Bright";

			const chalkFunc = chalk[chalkMethod as keyof ChalkInstance] as unknown;
			return chalkFunc instanceof Function
				? (chalkFunc as (...text: unknown[]) => string)(styledText)
				: styledText;
		}, text);
	},

	_handleTildeCase(
		text: string,
		match: RegExpMatchArray,
		_content: string,
		_tag: string,
	): [string, string] {
		let content = _content;
		let tag = _tag;

		if (/(^~~|~~$)/g.test(content)) {
			return [content, tag];
		}

		// Handle cases where content starts or ends with tilde (~)
		if (text[match.index ?? -1] === "~") {
			content = tag; // The content is actually the tag here
			tag = "";
		} else if (content.endsWith("~") && tag.startsWith("<")) {
			content = content.replace(/~$/, "") + tag; // Append the tagc to the content if content ends with "~"
		}

		return [content, tag];
	},

	/**
	 * Generates a colored text based on a condition.
	 *
	 * @param condition Determines whether to apply the color.
	 * @param color The color to apply to the text.
	 * @param text The text to be colored.
	 */
	if(condition: boolean, color: string, text: string): string {
		return condition ? `<${color}>${text}</${color}>` : `<gray>${text}</gray>`;
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
	stripTags(text: string): string {
		let newText: string;

		/*
		 * Regular expressions created by AIs, it removes the "<b>"'s but keeps the "~<b>"'s since the '~' here works like an escape character.
		 * It does however remove the escape character itself.
		 * Remove unescaped tags
		 */
		newText = text.replaceAll(/(?<!~)<.+?>/g, "");

		// Remove escape character
		newText = newText.replaceAll(/~(<.+?>)/g, "$1");

		return newText;
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
