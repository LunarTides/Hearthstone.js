module.exports = {
    name: "Mistress of Mixtures",
    stats: [2, 2],
    desc: "Deathrattle: Restore 4 Health to each hero.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Common",
    set: "Core",

    deathrattle(plr, game, card) {
        game.player1.addHealth(4);
        game.player2.addHealth(4);
    }
}