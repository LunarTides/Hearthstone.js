module.exports = {
    name: "Dragonqueen Alexstrasza",
    stats: [8, 8],
    desc: "Battlecry: If your deck has no duplicates, add 2 other random Dragons to your hand. They cost (0).",
    mana: 9,
    tribe: "Dragon",
    class: "Neutral",
    rarity: "Legendary",
    set: "Descent of Dragons",
    id: 164,

    battlecry(plr, game, self) {
        if (!game.functions.highlander(plr)) return;

        let list = Object.values(game.functions.getCards()).filter(c => game.functions.getType(c) == "Minion" && game.functions.matchTribe(c.tribe, "Dragon"));

        for (let i = 0; i < 2; i++) {
            let card = game.functions.randList(list);
            card = new game.Card(card.name, plr);

            //card.mana = 0;
            card.addEnchantment("mana = 0", self);

            plr.addToHand(card);
        }
    }
}
