import type { Game } from "@Core/game.js";
import type { Logger } from "@Core/logger.js";

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
