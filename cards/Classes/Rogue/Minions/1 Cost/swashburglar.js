module.exports = {
    name: "Swashburglar",
    stats: [1, 1],
    desc: "&BBattlecry: &RAdd a random card from another class to your hand.",
    mana: 1,
    tribe: "Pirate",
    class: "Rogue",
    rarity: "Common",
    set: "One Night in Karazhan",
    id: 276,

    battlecry(plr, game, self) {
        let list = game.functions.getCards().filter(c => !game.functions.validateClass(plr, c));
        let card = game.functions.randList(list);
        if (!card) return;
        
        card = new game.Card(card.name, plr);

        plr.addToHand(card);
    }
}
