module.exports = {
    name: "Combined Example 2 Corrupted",
    stats: [9, 9],
    desc: "Colossal +2. Dormant. Corrupted. Battlecry: Dredge.",
    mana: 0,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    colossal: ["Combined Example 2 Left Arm", "", "Combined Example 2 Right Arm"],
    keywords: ["Dormant"],
    uncollectible: true,

    battlecry(plr, game, self) {
        game.interact.dredge();
    }
}
