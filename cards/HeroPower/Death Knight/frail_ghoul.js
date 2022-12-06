module.exports = {
    name: "Death Knight Frail Ghoul",
    displayName: "Frail Ghoul",
    stats: [1, 1],
    desc: "Charge. At the end of your turn, this minion dies.",
    mana: 1,
    tribe: "Undead",
    class: "Death Knight",
    rarity: "Free",
    set: "Basic",
    keywords: ["Charge"],

    endofturn(plr, game, self) {
        self.kill();
    }
}
