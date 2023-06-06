// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Sanguine Soldier",
    stats: [2, 1],
    desc: "&BDivine Shield. Battlecry:&R Deal 2 damage to your hero.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Paladin",
    rarity: "Rare",
    set: "March of the Lich King",
    keywords: ["Divine Shield"],
    id: 254,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        game.attack(2, plr);
    }
}
