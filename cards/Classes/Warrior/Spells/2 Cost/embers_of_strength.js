// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Embers of Strength",
    desc: "Summon two 1/2 Guards with Taunt. Manathirst (6): Give them +1/+2.",
    mana: 2,
    type: "Spell",
    class: "Warrior",
    rarity: "Rare",
    set: "March of the Lich King",
    spellClass: "Fire",
    id: 110,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let minion = new game.Card("Emberbound Guard", plr);

        if (self.manathirst(6)) minion.addStats(1, 2);

        for (let i = 0; i < 2; i++) game.summonMinion(game.functions.cloneCard(minion, plr), plr);
    }
}
