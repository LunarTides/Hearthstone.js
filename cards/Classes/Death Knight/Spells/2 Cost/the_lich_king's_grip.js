module.exports = {
    name: "The Lich King's Grip",
    displayName: "Death Grip",
    desc: "Steal a minion from your opponent's deck and add it to your hand.",
    mana: 2,
    class: "Death Knight",
    rarity: "Free",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    uncollectible: true,
    id: 127,

    cast(plr, game, self) {
        let minion = plr.getOpponent().deck.filter(c => c.type == "Minion");
        minion = game.functions.randList(minion, false);
        if (!minion) return;

        game.functions.remove(plr.getOpponent().deck, minion);

        minion = game.functions.cloneCard(minion);

        plr.addToHand(minion);
    }
}