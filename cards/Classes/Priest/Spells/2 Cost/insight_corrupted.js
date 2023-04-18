module.exports = {
    name: "Insight Corrupted",
    displayName: "Insight",
    desc: "Corrupted. Draw a minion. Reduce its Cost by (2).",
    mana: 2,
    class: "Priest",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    keywords: ["Corrupted"],
    spellClass: "Shadow",
    uncollectible: true,

    cast(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Minion");
        let minion = game.functions.randList(list, false);
        if (!minion) return;

        //minion.mana -= 2;
        minion.addEnchantment("-2 mana", self);
        if (minion.mana < 0) minion.mana = 0;

        plr.drawSpecific(minion);
    }
}
