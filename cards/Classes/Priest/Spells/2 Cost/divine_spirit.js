module.exports = {
    name: "Divine Spirit",
    desc: "Double a minion's Health.",
    mana: 2,
    class: "Priest",
    rarity: "Common",
    set: "Legacy",
    spellClass: "Holy",

    cast(plr, game, card) {
        let target = game.functions.selectTarget("Double a minion's Health.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.setStats(target.getAttack(), target.getHealth() * 2);
    }
}