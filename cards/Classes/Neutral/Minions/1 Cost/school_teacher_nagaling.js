module.exports = {
    name: "School Teacher Nagaling",
    displayName: "Nagaling",
    stats: [1, 1],
    desc: "Battlecry: Cast {0}.",
    mana: 1,
    type: "Minion",
    tribe: "Naga",
    class: "Neutral",
    rarity: "Free",
    set: "Voyage to the Sunken City",
    uncollectible: true,

    battlecry(plr, game, self) {
        if (self.storage.length <= 0) return;

        self.storage[0].activate("cast");
    }
}
