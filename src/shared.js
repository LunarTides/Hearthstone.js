let game = null;
let cards = null;

function set(new_game = null) {
    if (!new_game) return;

    game = new_game;

    // Update the players' internal game
    [game.player1, game.player2].forEach(p => {
        if (!p.getInternalGame) return;

        p.getInternalGame();
    });
}

function get() {
    return game;
}

module.exports = {
    set,
    get
}
