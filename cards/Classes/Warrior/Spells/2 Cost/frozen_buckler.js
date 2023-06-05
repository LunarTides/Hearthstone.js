// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Frozen Buckler",
    desc: "Gain 10 Armor. At the start of your next turn, lose 5 Armor.",
    mana: 2,
    type: "Spell",
    class: "Warrior",
    rarity: "Epic",
    set: "Fractured in Alterac Valley",
    spellClass: "Frost",
    id: 111,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        plr.armor += 10;

        game.functions.addEventListener("StartTurn", (val) => {
            return game.player != plr;
        }, () => {
            plr.armor -= 5;
            if (plr.armor < 0) plr.armor = 0;
        }, 1);
    }
}
