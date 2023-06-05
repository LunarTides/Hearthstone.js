// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Kobold Librarian",
    stats: [2, 1],
    desc: "&BBattlecry:&R Draw a card. Deal 2 damage to your hero.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Warlock",
    rarity: "Common",
    set: "Kobolds & Catacombs",
    id: 289,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        plr.drawCard();
        game.attack(2, plr);
    }
}
