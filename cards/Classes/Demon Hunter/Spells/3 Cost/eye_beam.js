module.exports = {
    name: "Eye Beam",
    desc: "Lifesteal. Deal 3 damage to a minion. Outcast: This costs (1).",
    mana: 3,
    class: "Demon Hunter",
    rarity: "Epic",
    set: "Demon Hunter Initiate",
    spellClass: "Fel",
    id: 203,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Lifesteal. Deal 3 damage to a minion.", true, null, "minion");
        if (!target) return -1;

        game.functions.spellDmg(target, 3);
        plr.addHealth(3 + plr.spellDamage);
    },

    outcast(plr, game, self) {
        self.mana = 1;
    }
}
