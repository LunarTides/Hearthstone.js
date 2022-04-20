module.exports = {
    name: "Deathrattle Test",
    type: "Minion",
    stats: [2, 1],
    desc: "Deathrattle: Summon a random 2-Cost minion.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",

    deathrattle(plr, game) {
        game.playMinion(new game.Minion("Plant", plr), plr);
        game.playMinion(new game.Minion("Plant", plr), plr);
    }
}