// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Armor Vendor",
    stats: [1, 3],
    desc: "Battlecry: Give 4 Armor to each hero.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Madness at the Darkmoon Faire",
    id: 32,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        game.player1.armor += 4;
        game.player2.armor += 4;
    }
}
