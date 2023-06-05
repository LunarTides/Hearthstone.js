// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Drain Soul",
    desc: "&BLifesteal.&R Deal 3 damage to a minion.",
    mana: 2,
    type: "Spell",
    class: "Warlock",
    rarity: "Common",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    id: 301,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, true, null, "minion");
        if (!target) return -1;

        game.functions.spellDmg(target, 3);

        plr.addHealth(3 + plr.spellDamage);
    }
}
