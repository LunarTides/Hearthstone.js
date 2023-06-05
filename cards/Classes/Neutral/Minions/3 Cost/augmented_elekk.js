// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Augmented Elekk",
    stats: [3, 4],
    desc: "Whenever you shuffle a card into a deck, shuffle in an extra copy.",
    mana: 3,
    type: "Minion",
    tribe: "Beast",
    class: "Neutral",
    rarity: "Epic",
    set: "The Boomsday Project",
    id: 42,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, card, key, val) {
        if (key != "AddCardToDeck" || game.player != plr) return;
        
        let copy = game.functions.cloneCard(val);
        plr.shuffleIntoDeck(copy, false);
    }
}
