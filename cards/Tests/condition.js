module.exports = {
    name: "Condition Test",
    stats: [5, 2],
    desc: "&BBattlecry:&R If your deck has no duplicates, draw a card.",
    mana: 1,
    tribe: "Human",
    class: "Paladin",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,

    battlecry(plr, game, self) {
        if (!self.activate("condition")[0]) return;

        plr.drawCard();
    },

    condition(plr, game, self) {
        return game.functions.highlander(plr);
    }
}
