module.exports = {
    name: "Truesilver Champion",
    stats: [4, 2],
    desc: "Whenever your hero attacks, restore 2 Health to it.",
    mana: 4,
    class: "Paladin",
    rarity: "Free",
    set: "Legacy",
    id: 263,

    onattack(plr, game, self) {
        plr.addHealth(2);
    }
}
