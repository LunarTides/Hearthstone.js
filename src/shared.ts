import { Game } from "./game";

/**
 * @type {Game | null}
 */
let game: Game | null = null;

/**
 * Sets the game as a shared variable
 */
export function set(new_game: Game | null = null): void {
    if (!new_game) return;

    game = new_game;

    // Update the players' internal game
    [game.player1, game.player2].forEach(p => {
        if (!p) return;
        if (!p.getInternalGame) return;

        p.getInternalGame();
    });
}

/**
 * Gets the shared game
 * 
 * @returns {Game | null}
 */
export function get() {
    return game;
}