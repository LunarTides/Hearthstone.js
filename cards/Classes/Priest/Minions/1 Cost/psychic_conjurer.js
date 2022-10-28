module.exports = {
    name: "Psychic Conjurer",
    stats: [1, 1],
    desc: "Battlecry: Copy a card in your opponent's deck and add it to your hand.",
    mana: 1,
    tribe: "None",
    class: "Priest",
    rarity: "Free",
    set: "Basic",

    battlecry(plr, game, self) {
        let possible_cards = game.opponent.deck;
        if (possible_cards.length <= 0) return;

        let card = game.functions.randList(possible_cards);
        card = game.functions.cloneCard(card, plr);

        plr.addToHand(card);
    }
}