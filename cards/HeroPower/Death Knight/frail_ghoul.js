module.exports = {
    name: "Death Knight Frail Ghoul",
    displayName: "Frail Ghoul",
    stats: [1, 1],
    desc: "Charge. At the end of your turn, this minion dies.",
    mana: 1,
    type: "Minion",
    tribe: "Undead",
    class: "Death Knight",
    rarity: "Free",
    set: "Basic",
    keywords: ["Charge"],
    uncollectible: true,
    id: 79,

    passive(plr, game, self, key, val) {
        if (key != "EndTurn" || game.player != plr) return;

        self.kill();
    }
}
