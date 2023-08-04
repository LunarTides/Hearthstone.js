// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Identity Theft",
    desc: "&BDiscover&R a copy of a card from your opponent's hand and deck.",
    mana: 3,
    type: "Spell",
    class: "Priest",
    rarity: "Common",
    set: "Murder at Castle Nathria",
    spellClass: "Shadow",
    id: 249,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let list = plr.getOpponent().hand;
        let handCard = game.interact.discover("Discover a copy of a card from your opponent's hand.", list, false);
        if (!handCard) return -1;

        list = plr.getOpponent().deck;
        deckCard = game.interact.discover("Discover a copy of a card from your opponent's deck.", list, false);
        if (!deckCard) return -1;

        plr.addToHand(handCard);
        plr.addToHand(deckCard);
    }
}
