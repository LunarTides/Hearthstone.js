let Shared = module.exports = {
    game: null,

    set(new_game = null) {
        if (!new_game) return;

        Shared.game = new_game;

        // Update the players' internal game
        [Shared.game.player1, Shared.game.player2].forEach(p => {
            if (!p.getInternalGame) return;

            p.getInternalGame();
        });
    },

    get() {
        return Shared.game;
    }
}