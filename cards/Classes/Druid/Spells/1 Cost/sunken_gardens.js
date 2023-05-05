module.exports = {
    name: "Sunken Gardens",
    desc: "Give +1/+1 to all minions in your hand, deck, and battlefield.",
    mana: 1,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "Voyage to the Sunken City",
    id: 19,

    cast(plr, game, card) {
        plr.hand.forEach(c => {
            if (c.type === "Minion") {
                c.addStats(1, 1);
            }
        });

        plr.deck.forEach(c => {
            if (c.type === "Minion") {
                c.addStats(1, 1);
            }
        });

        game.board[plr.id].forEach(c => {
            if (c.type === "Minion") {
                c.addStats(1, 1);
            }
        });
    }
}
