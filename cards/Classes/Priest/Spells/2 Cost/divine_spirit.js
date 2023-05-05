module.exports = {
    name: "Divine Spirit",
    desc: "Double a minion's Health.",
    mana: 2,
    type: "Spell",
    class: "Priest",
    rarity: "Common",
    set: "Legacy",
    spellClass: "Holy",
    id: 72,

    cast(plr, game, card) {
        let target = game.interact.selectTarget("Double a minion's Health.", true, null, "minion");

        if (!target) return -1;

        target.addStats(0, target.getHealth());
    }
}
