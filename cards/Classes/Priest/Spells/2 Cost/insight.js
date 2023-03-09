module.exports = {
    name: "Insight",
    desc: "Draw a minion. Corrupt: Reduce its Cost by (2).",
    mana: 2,
    class: "Priest",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    keywords: ["Corrupt"],
    spellClass: "Shadow",
    corrupt: "Insight Corrupted",
    id: 175,

    cast(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Minion");
        let minion = game.functions.randList(list, false);
        if (!minion) return;

        plr.drawSpecific(minion);
    }
}