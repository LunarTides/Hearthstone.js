module.exports = {
    name: "Healing Totem",
    stats: [0, 2],
    desc: "At the end of your turn, restore 1 Health to all friendly minions.",
    mana: 1,
    tribe: "Totem",
    class: "Shaman",
    rarity: "Free",
    set: "Legacy",
    id: 82,
    uncollectible: true,

    endofturn(plr, game) {
        var t = game.board[plr.id];

        if (t.length > 0) {
            t.forEach(m => {
                m.addStats(0, 1, true);
            });
        }
    }
}
