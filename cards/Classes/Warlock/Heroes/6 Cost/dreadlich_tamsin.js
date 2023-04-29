module.exports = {
    name: "Dreadlich Tamsin",
    desc: "&BBattlecry:&R Deal 3 damage to all minions. Shuffle 3 Rifts into your deck. Draw 3 cards.",
    mana: 6,
    type: "Hero",
    class: "Warlock",
    rarity: "Legendary",
    set: "Fractured in Alterac Valley",
    hpDesc: "Shuffle a Rift into your deck. Draw a card.",
    id: 297,

    battlecry(plr, game, self) {
        // Deal 3 damage to all minions.
        game.board.forEach(p => {
            p.forEach(m => {
                game.attack(3, m);
            });
        });

        // Shuffle 3 Rifts into your deck.
        for (let i = 0; i < 3; i++) plr.shuffleIntoDeck(new game.Card("Fel Rift", plr));

        // Draw 3 cards.
        for (let i = 0; i < 3; i++) plr.drawCard();
    },

    heropower(plr, game, self) {
        // Shuffle a Rift into your deck.
        let rift = new game.Card("Fel Rift", plr);
        plr.shuffleIntoDeck(rift);

        // Draw a card.
        plr.drawCard();
    }
}
