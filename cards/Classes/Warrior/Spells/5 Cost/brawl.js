module.exports = {
    name: "Brawl",
    desc: "Destroy all minions except one.",
    mana: 5,
    type: "Spell",
    class: "Warrior",
    rarity: "Epic",
    set: "Legacy",
    id: 116,

    cast(plr, game, self) {
        // If the board is empty for both sides, refund the card
        if (game.board[0].length == 0 && game.board[1].length == 0) return -1;

        // Choose a random side
        let side = game.functions.randInt(0, 1);
        // If the board is empty for that side, choose the other side
        if (game.board[side].length == 0) side = (side == 0) ? 1 : 0;

        // Choose a random minion
        let minion = game.functions.randInt(0, game.board[side].length - 1);

        minion = game.board[side][minion];

        game.board.forEach(p => {
            p.forEach(m => {
                if (m == minion) return;

                m.kill();
            });
        });
    }
}
