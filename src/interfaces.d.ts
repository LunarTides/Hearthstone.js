import type { Game, Logger } from "./internal.js";

declare global {
	/**
	 * The global game
	 */
	var game: Game;

	/**
	 * The global logger
	 */
	var logger: Logger;
}
