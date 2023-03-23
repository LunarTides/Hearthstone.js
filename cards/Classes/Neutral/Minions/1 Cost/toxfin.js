module.exports = {
    name: "Toxfin",
    stats: [1, 2],
    desc: "&BBattlecry:&R Give a friendly Murloc &BPoisonous&R.",
    mana: 1,
    tribe: "Murloc",
    class: "Neutral",
    rarity: "Common",
    id: 306,

    battlecry(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, false, "friendly", "minion");
        if (!target || !target.tribe.includes("Murloc")) return -1;

        target.addKeyword("Poisonous");
    }
}
