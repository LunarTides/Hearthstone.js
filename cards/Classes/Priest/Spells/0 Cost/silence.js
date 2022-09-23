module.exports = {
    name: "Silence",
    desc: "Silence a minion.",
    mana: 0,
    class: "Priest",
    rarity: "Common",
    set: "Legacy",
    spellClass: "Shadow",

    cast(plr, game, card) {
        let target = game.functions.selectTarget("Silence a minion.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.silence();
    }
}