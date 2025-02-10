/**
 * Functions
 * @module Functions
 */

import {
	cardFunctions,
	colorFunctions,
	deckcodeFunctions,
	infoFunctions,
	utilFunctions,
} from "@Game/internal.js";

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
};
