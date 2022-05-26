module.exports = {
    name: "Start of Game Test",
    stats: [1, 1],
    desc: "Start of Game: Gain +1/+1.",
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",

    startofgame(plr, game, card) {
        card.addStats(1, 1);
    }
}