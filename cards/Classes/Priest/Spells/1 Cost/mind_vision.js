module.exports = {
    name: "Mind Vision",
    desc: "Put a copy of a random card in your opponent's hand into your hand.",
    mana: 1,
    class: "Priest",
    rarity: "Free",
    set: "Legacy",
    spellClass: "Shadow",

    cast(plr, game, card) {
        var possible_cards = game.opponent.hand;
        if (possible_cards.length <= 0) return;

        var card = game.functions.randList(possible_cards);
        plr.addToHand(card);
    }
}