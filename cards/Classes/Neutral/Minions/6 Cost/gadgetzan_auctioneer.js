// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Gadgetzan Auctioneer",
    stats: [4, 4],
    desc: "Whenever you cast a spell, draw a card.",
    mana: 6,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Core",
    id: 53,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, card, key, val) {
        if (key != "spellsCast" || game.player != plr) return;
        
        plr.drawCard();
    }
}
