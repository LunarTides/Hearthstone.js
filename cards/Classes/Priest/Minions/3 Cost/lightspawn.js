module.exports = {
    name: "Lightspawn",
    stats: [0, 4],
    desc: "This minion's Attack is always equal to its Health.",
    mana: 3,
    tribe: "Elemental",
    class: "Priest",
    rarity: "Common",
    set: "Legacy",

    passive(plr, game, self, trigger) {
        self.setStats(self.getHealth(), self.getHealth());
    }
}