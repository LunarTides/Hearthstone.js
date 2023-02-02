module.exports = {
    name: "Brawl",
    desc: "Destroy all minions except one.",
    mana: 5,
    class: "Warrior",
    rarity: "Epic",
    set: "Legacy",
    id: 116,

    cast(plr, game, self) {
        let side = game.functions.randInt(0, 1);
        let minion = game.functions.randInt(0, game.board[side].length - 1);

        minion = game.board[side][minion];

        let otherSide = (side == 0) ? 1 : 0;

        game.board[otherSide] = [];
        game.board[side] = game.board[side].filter(m => m == minion);
    }
}
