// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Mind Vision",
    desc: "Put a copy of a random card in your opponent's hand into your hand.",
    mana: 1,
    type: "Spell",
    class: "Priest",
    rarity: "Free",
    set: "Legacy",
    spellClass: "Shadow",
    id: 71,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        var possible_cards = game.opponent.hand;
        if (possible_cards.length <= 0) return;

        var card = game.functions.randList(possible_cards);
        plr.addToHand(card);
    }
}
