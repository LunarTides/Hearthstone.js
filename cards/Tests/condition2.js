module.exports = {
    name: "Another Condition Test",
    stats: [5, 2],
    desc: "&BBattlecry:&R If your deck has no duplicates, draw a card.",
    mana: 1,
    tribe: "Human",
    class: "Paladin",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,
    conditioned: ["battlecry"], // By having this here, the battlecry function below will only trigger if the condition function returns true

    battlecry(plr, game, self) {
        plr.drawCard();
    },

    condition(plr, game, self) {
        return game.functions.highlander(plr);
    }
}
