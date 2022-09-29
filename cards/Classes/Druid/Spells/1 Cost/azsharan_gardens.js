module.exports = {
    name: "Azsharan Gardens",
    desc: "Give all minions in your hand +1/+1. Put a 'Sunken Gardens' on the bottom of your deck.",
    mana: 1,
    class: "Druid",
    rarity: "Common",
    set: "Voyage to the Sunken City",

    cast(plr, game, card) {
        plr.hand.forEach(c => {
            if (c.type === "Minion") {
                c.addStats(1, 1);
            }
        });

        plr.addToBottomOfDeck(new game.Card("Sunken Gardens", plr));
    }
}