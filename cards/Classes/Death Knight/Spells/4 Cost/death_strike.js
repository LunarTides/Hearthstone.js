// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Death Strike",
    desc: "Lifesteal. Deal 6 damage to a minion.",
    mana: 4,
    type: "Spell",
    class: "Death Knight",
    rarity: "Common",
    set: "Core",
    runes: "B",
    id: 190,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let dmg = 6 + plr.spellDamage;

        let target = game.interact.selectTarget(`Lifesteal. Deal ${dmg} damage to a minion.`, self, null, "minion");
        if (!target) return -1;

        game.functions.spellDmg(target, 6);
        plr.addHealth(dmg);
    }
}
