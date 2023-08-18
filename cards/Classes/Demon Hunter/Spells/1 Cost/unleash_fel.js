// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Unleash Fel",
    desc: "Deal $1 damage to all enemies. Manathirst (6): With Lifesteal.",
    mana: 1,
    type: "Spell",
    class: "Demon Hunter",
    rarity: "Rare",
    set: "March of the Lich King",
    spellClass: "Fel",
    id: 199,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let manathirst = self.manathirst(6);

        let doDamage = (t) => {
            game.attack("$1", t);
            if (manathirst) plr.addHealth(1 + plr.spellDamage);
        }

        game.functions.doPlayerTargets(plr.getOpponent(), doDamage);
    }
}
