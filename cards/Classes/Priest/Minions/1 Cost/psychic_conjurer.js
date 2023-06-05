// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Psychic Conjurer",
    stats: [1, 1],
    desc: "Battlecry: Copy a card in your opponent's deck and add it to your hand.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Priest",
    rarity: "Free",
    set: "Basic",
    id: 62,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let possible_cards = game.opponent.deck;
        if (possible_cards.length <= 0) return;

        let card = game.functions.randList(possible_cards);
        card = game.functions.cloneCard(card);

        plr.addToHand(card);
    }
}
