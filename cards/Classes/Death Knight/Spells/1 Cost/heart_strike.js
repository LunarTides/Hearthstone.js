// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Heart Strike",
    desc: "Deal $3 damage to a minion. If that kills it, gain a Corpse.",
    mana: 1,
    type: "Spell",
    class: "Death Knight",
    rarity: "Common",
    set: "Core",
    runes: "B",
    id: 182,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, self, null, "minion");
        if (!target) return -1;

        let newHealth = game.attack("$3", target);

        if (newHealth > 0) return;

        // Gain a corpse
        plr.corpses++;
    }
}
