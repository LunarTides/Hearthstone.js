module.exports = {
    name: "Widowbloom Seedsman",
    stats: [3, 2],
    desc: "Battlecry: Draw a Nature spell. Gain an empty Mana Crystal.",
    mana: 4,
    type: "Minion",
    tribe: "None",
    class: "Druid",
    rarity: "Epic",
    set: "Murder at Castle Nathria",
    id: 141,

    battlecry(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Spell" && c.spellClass == "Nature");
        let card = game.functions.randList(list, false);
        if (!card) return;

        plr.drawSpecific(card);
        plr.gainEmptyMana(1, true);
    }
}
