module.exports = {
    name: "Inner Fire",
    desc: "Change a minion's Attack to be equal to its Health.",
    mana: 1,
    class: "Priest",
    rarity: "Common",
    set: "Legacy",

    cast(plr, game, card) {
        let target = game.interact.selectTarget("Change a minion's Attack to be equal to its Health.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.setStats(target.getHealth(), target.getHealth());
    }
}
