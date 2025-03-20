import { cardFunctions } from "./card.ts";
import { colorFunctions } from "./color.ts";
import { deckcodeFunctions } from "./deckcode.ts";
import { infoFunctions } from "./info.ts";
import { interactFunctions } from "./interact.ts";
import { utilFunctions } from "./util.ts";

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

	/**
	 * Interaction functions
	 */
	interact: interactFunctions,
};
