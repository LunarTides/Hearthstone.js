module.exports = {
    name: "Map to the Golden Monkey",
    desc: "Shuffle the Golden Monkey into your deck. Draw a card.",
    mana: 2,
    class: "Neutral",
    rarity: "Free",
    set: "The League of Explorers",
    uncollectible: true,

    cast(plr, game, card) {
        plr.shuffleIntoDeck(new game.Minion("Golden Monkey", plr));

        plr.drawCard();
    }
}