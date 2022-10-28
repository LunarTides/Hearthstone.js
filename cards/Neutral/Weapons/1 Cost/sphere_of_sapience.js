module.exports = {
    name: "Sphere of Sapience",
    stats: [0, 4],
    desc: "At the start of your turn, look at your top card. You can put it on the bottom and lose 1 Durability.",
    mana: 1,
    class: "Neutral",
    rarity: "Legendary",
    set: "Scholomance Academy",

    startofturn(plr, game, card) {
        let top = plr.deck.pop();
        
        if (!top) return;

        game.interact.printName();
        game.interact.printAll(plr);

        let answer = game.input("\nPut " + top.name + " on the bottom of your deck? (Y/N) ");
        
        if (answer.toLowerCase() == "y") {
            plr.deck.unshift(top);
            card.remStats(0, 1);
        } else {
            plr.deck.push(top);
        }
    }
}