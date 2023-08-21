// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Death Strike",
    desc: "Lifesteal. Deal $6 damage to a minion.",
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
        let target = game.interact.selectTarget(self.desc, self, null, "minion");
        if (!target) return -1;

        game.attack("$6", target);
        plr.addHealth(6 + plr.spellDamage);
    }
}
