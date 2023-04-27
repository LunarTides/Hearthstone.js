module.exports = {
    name: "Mirage Caller",
    stats: [2, 3],
    desc: "&BBattlecry:&R Choose a friendly minion. Summon a 1/1 copy of it.",
    mana: 3,
    tribe: "None",
    class: "Priest",
    rarity: "Rare",
    id: 320,

    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Choose a friendly minion. Summon a 1/1 copy of it.", false, "friendly", "minion");
        if (!target) return -1;

        let copy = new game.Card(target.name, plr); // Create an imperfect copy
        copy.setStats(1, 1);

        game.summonMinion(copy, plr);
    }
}
