module.exports = {
    name: "Healing Totem",
    type: "Minion",
    stats: [0, 2],
    desc: "At the end of your turn, restore 1 Health to all friendly minions.",
    mana: 1,
    tribe: "Totem",
    class: "Shaman",
    rarity: "Free",
    set: "Legacy",

    endofturn(plr, game) {
        var t = game.getBoard()[plr.id];

        if (t.length > 0) {
            game.getBoard()[plr.id].forEach(m => {
                m.addStats(0, 1, true);
            });
        }
    }
}