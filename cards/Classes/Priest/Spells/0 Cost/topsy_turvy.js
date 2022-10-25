module.exports = {
    name: "Topsy Turvy",
    desc: "Swap a minion's Attack and Health.",
    mana: 0,
    class: "Priest",
    rarity: "Common",
    set: "The Boomsday Project",

    cast(plr, game, card) {
        let target = game.functions.selectTarget("Swap a minion's Attack and Health.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.setStats(target.getHealth(), target.getAttack());
        target.resetMaxHealth();
    }
}