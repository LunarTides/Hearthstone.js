module.exports = {
    name: "Overheal Test",
    stats: [2, 1],
    desc: "&BOverheal:&R Draw a card.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,

    overheal(plr, game, self) {
        plr.drawCard();
    }
}
