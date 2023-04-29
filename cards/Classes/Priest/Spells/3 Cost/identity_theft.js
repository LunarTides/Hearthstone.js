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

    cast(plr, game, self) {
        let list = plr.getOpponent().hand;
        game.interact.discover("Discover a copy of a card from your opponent's hand.", list);

        list = plr.getOpponent().deck;
        game.interact.discover("Discover a copy of a card from your opponent's deck.", list);
    }
}
