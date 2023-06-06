// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Eye Beam",
    desc: "Lifesteal. Deal 3 damage to a minion. Outcast: This costs (1).",
    mana: 3,
    type: "Spell",
    class: "Demon Hunter",
    rarity: "Epic",
    set: "Demon Hunter Initiate",
    spellClass: "Fel",
    id: 203,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget("Lifesteal. Deal 3 damage to a minion.", true, null, "minion");
        if (!target) return -1;

        game.functions.spellDmg(target, 3);
        plr.addHealth(3 + plr.spellDamage);
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    outcast(plr, game, self) {
        self.mana = 1;
    }
}
