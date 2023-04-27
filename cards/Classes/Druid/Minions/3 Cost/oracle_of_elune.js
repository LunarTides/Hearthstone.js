module.exports = {
    name: "Oracle of Elune",
    stats: [2, 4],
    desc: "After you play a minion that costs (2) or less, summon a copy of it.",
    mana: 3,
    tribe: "None",
    class: "Druid",
    rarity: "Epic",
    set: "United in Stormwind",
    id: 140,

    passive(plr, game, self, key, val) {
        if (!["SummonMinion", "PlayCard"].includes(key)) return; // If key is not "SummonMinion" or "PlayCard", return
        if (key == "PlayCard" && val.type != "Minion") return;

        if (val.mana > 2) return;

        // The card is a minion and it costs 2 or less
        let copy = game.functions.cloneCard(val);

        game.summonMinion(copy, plr, false);
    }
}
