/**
 * Functions
 * @module Functions
 */

import {
    _deckcodeFunctions,
    _fsFunctions,
    _cardFunctions,
    _keywordFunctions,
    _colorFunctions,
    _utilFunctions,
    _infoFunctions,
    _eventFunctions,
    _errorFunctions
} from "../../internal.js";

export const functions = {
    // TODO: Create better docstrings. (remember to also change the docstrings for, for example, functions.card.vanilla)
    /**
     * Deckcode related functions
     */
    deckcode: _deckcodeFunctions,

    /**
     * File-system related functions
     */
    file: _fsFunctions,

    /**
     * Card related functions
     */
    card: _cardFunctions,

    /**
     * Keyword related functions
     */
    keyword: _keywordFunctions,

    /**
     * Color related functions
     */
    color: _colorFunctions,

    /**
     * Utility functions
     */
    util: _utilFunctions,

    /**
     * Info functions
     */
    info: _infoFunctions,

    /**
     * Event related functions
     */
    event: _eventFunctions,

    /**
     * Error related functions
     */
    error: _errorFunctions,
}
