// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Conjured Arrow",
    desc: "Deal $2 damage to a minion. Manathirst (6): Draw that many cards.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Rare",
    set: "March of the Lich King",
    spellClass: "Arcane",
    id: 219,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, self);
        if (!target) return -1;

        game.attack("$2", target);

        if (self.manathirst(6)) for (let i = 0; i < 2 + plr.spellDamage; i++) plr.drawCard();
    }
}
