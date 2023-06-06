// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Bash",
    desc: "Deal 3 damage. Gain 3 Armor.",
    mana: 2,
    type: "Spell",
    class: "Warrior",
    rarity: "Common",
    set: "The Grand Tournament",
    id: 108,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget("Deal 3 damage.", true);
        if (!target) return -1;

        game.attack(3, target);
        plr.armor += 3;
    }
}
