const { Game } = require("./game");

let Shared = module.exports = {
    /**
     * @type {Game | null}
     */
    game: null,

    /**
     * Sets the game as a shared variable
     * 
     * @param {Game | null} [new_game]
     */
    set(new_game = null) {
        if (!new_game) return;

        Shared.game = new_game;

        // Update the players' internal game
        [Shared.game.player1, Shared.game.player2].forEach(p => {
            if (!p) return;
            if (!p.getInternalGame) return;

            p.getInternalGame();
        });
    },

    /**
     * Gets the shared game
     * 
     * @returns {Game | null}
     */
    get() {
        return Shared.game;
    }
}