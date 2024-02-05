import { type Game, type Logger } from './internal.js';

declare global {
    /**
     * The global game
     */
    // eslint-disable-next-line no-var, no-unused-vars
    var game: Game;

    /**
     * The global logger
     */
    // eslint-disable-next-line no-var, no-unused-vars
    var logger: Logger;
}
