module.exports = {
    name: "Alliance Bannerman",
    stats: [2, 2],
    desc: "&BBattlecry:&R Draw a minion. Give minions in your hand +1/+1.",
    mana: 3,
    tribe: "None",
    class: "Paladin",
    rarity: "Common",
    set: "United in Stormwind",
    id: 259,

    battlecry(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Minion");
        let minion = game.functions.randList(list, false);
        if (minion) plr.drawSpecific(minion);

        plr.hand.filter(c => c.type == "Minion").forEach(m => {
            m.addStats(1, 1);
        });
    }
}
