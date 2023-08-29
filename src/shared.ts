import { Game } from "./game";

let game: Game;

/**
 * Sets the game as a shared variable
 */
export function set(new_game: Game): void {
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
 */
export function get(): Game {
    return game;
}