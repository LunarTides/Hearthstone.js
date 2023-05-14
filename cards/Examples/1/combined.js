module.exports = {
    name: "Combined Example 1",
    stats: [4, 4],
    desc: "&BTaunt, Divine Shield. Battlecry: Dredge.&R Gain +1/+1. (This example card combines everything you've learned in stage 1 into this card.)",
    mana: 1,
    type: "Minion",
    tribe: "All",
    class: "Priest / Paladin",
    rarity: "Legendary",
    keywords: ["Taunt", "Divine Shield"],
    uncollectible: true,

    battlecry(plr, game, self) {
        // Ordering is important. In the description it says that it dredges first, then adds +1/+1.
        game.interact.dredge();

        self.addStats(1, 1);
    }
}
