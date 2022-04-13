module.exports = {
    name: "Strength Totem",
    type: "Minion",
    stats: [0, 2],
    desc: "At the end of your turn, give another friendly minion +1 Attack.",
    mana: 1,
    tribe: "Totem",
    class: "Shaman",
    rarity: "Free",
    set: "Legacy",

    endofturn(plr, game) {
        var t = game.getBoard()[plr.id];

        if (t.length > 0) {
            game.getBoard()[plr.id][game.functions.randInt(0, t.length - 1)].addStats(1, 0);
        }
    }
}