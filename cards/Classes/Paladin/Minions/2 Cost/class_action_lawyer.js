module.exports = {
    name: "Class Action Lawyer",
    stats: [2, 3],
    desc: "&BBattlecry:&R If your deck has no Neutral cards, set a minion's stats to 1/1.",
    mana: 2,
    tribe: "None",
    class: "Paladin",
    rarity: "Rare",
    set: "Maw and Disorder",
    id: 255,

    battlecry(plr, game, self) {
        // Condition
        let list = plr.deck.filter(c => c.class == "Neutral");
        if (list.length > 0) return;

        // Condition cleared
        let target = game.interact.selectTarget("Set a minion's stats to 1/1.", true, null, "minion");
        if (!target) return -1;

        target.setStats(1, 1);
    }
}
