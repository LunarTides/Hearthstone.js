module.exports = {
    name: "Stonehearth Vindicator",
    stats: [3, 1],
    desc: "&BBattlecry: &RDraw a spell that costs (3) or less. It costs (0) this turn.",
    mana: 3,
    tribe: "None",
    class: "Paladin",
    rarity: "Epic",
    set: "Fractured in Alterac Valley",
    id: 261,

    battlecry(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Spell" && c.mana <= 3);
        let spell = game.functions.randList(list, false);
        if (!spell) return;

        let old_cost = spell.mana;
        spell.mana = 0;

        plr.drawSpecific(spell);

        game.functions.addPassive("turnEnds", () => {
            return true;
        }, () => {
            spell.mana = old_cost;
        }, 1);
    }
}
