// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Acidic Swamp Ooze",
    stats: [3, 2],
    desc: "Battlecry: Destroy your opponent's weapon.",
    mana: 2,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Core",
    id: 36,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, card) {
        plr.getOpponent().destroyWeapon(true);
    }
}
