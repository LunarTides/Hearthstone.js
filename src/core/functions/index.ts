/**
 * Functions
 * @module Functions
 */

import {
    DECKCODE_FUNCTIONS,
    CARD_FUNCTIONS,
    COLOR_FUNCTIONS,
    UTIL_FUNCTIONS,
    INFO_FUNCTIONS,
    EVENT_FUNCTIONS,
} from '../../internal.js';

export const FUNCTIONS = {
    // TODO: Create better docstrings. (remember to also change the docstrings for, for example, functions.card.vanilla). #324
    /**
     * Deckcode related functions
     */
    deckcode: DECKCODE_FUNCTIONS,

    /**
     * Card related functions
     */
    card: CARD_FUNCTIONS,

    /**
     * Color related functions
     */
    color: COLOR_FUNCTIONS,

    /**
     * Utility functions
     */
    util: UTIL_FUNCTIONS,

    /**
     * Info functions
     */
    info: INFO_FUNCTIONS,

    /**
     * Event related functions
     */
    event: EVENT_FUNCTIONS,
};
