module.exports = {
    name: "Silence Test",
    stats: [3, 2],
    desc: "Stealth. Divine Shield. Taunt. Charge. Battlecry: Silence this minion.",
    mana: 1,
    tribe: "Human",
    class: "Paladin",
    rarity: "Free",
    set: "Tests",
    keywords: ["Stealth", "Divine Shield", "Taunt", "Charge"],
    uncollectible: true,

    battlecry(plr, game, card) {
        card.silence()
    }
}