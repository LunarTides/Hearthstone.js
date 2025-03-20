import { Rarity } from "@Game/types.ts";
import { parseTags } from "chalk-tags";
import stripAnsi from "strip-ansi";

export const colorFunctions = {
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
	fromRarity(text: string, rarity: Rarity): string {
		let newText = "";

		switch (rarity) {
			case Rarity.Free: {
				newText = text;
				break;
			}

			case Rarity.Common: {
				newText = `<gray>${text}</gray>`;
				break;
			}

			case Rarity.Rare: {
				newText = `<blue>${text}</blue>`;
				break;
			}

			case Rarity.Epic: {
				newText = `<bright:magenta>${text}</bright:magenta>`;
				break;
			}

			case Rarity.Legendary: {
				newText = `<yellow>${text}</yellow>`;
				break;
			}

			default: {
				throw new Error("Unknown rarity");
			}
		}

		return parseTags(newText);
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
