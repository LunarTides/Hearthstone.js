/**
 * Functions
 * @module Functions
 */

import { cardFunctions } from "./card.js";
import { colorFunctions } from "./color.js";
import { deckcodeFunctions } from "./deckcode.js";
import { infoFunctions } from "./info.js";
import { interactFunctions } from "./interact.js";
import { utilFunctions } from "./util.js";

export const functions = {
	// TODO: Create better docstrings. (remember to also change the docstrings for, for example, functions.card.vanilla). #324
	/**
	 * Deckcode related functions
	 */
	deckcode: deckcodeFunctions,

	/**
	 * Card related functions
	 */
	card: cardFunctions,

	/**
	 * Color related functions
	 */
	color: colorFunctions,

	/**
	 * Utility functions
	 */
	util: utilFunctions,

	/**
	 * Info functions
	 */
	info: infoFunctions,

	interact: interactFunctions,
};
