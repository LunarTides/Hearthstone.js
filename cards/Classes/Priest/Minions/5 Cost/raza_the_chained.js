module.exports = {
    name: "Raza the Chained",
    stats: [5, 5],
    desc: "&BBattlecry:&R If your deck has no duplicates, your Hero Power costs (0) this game.",
    mana: 5,
    type: "Minion",
    tribe: "None",
    class: "Priest",
    rarity: "Legendary",
    set: "Mean Streets of Gadgetzan",
    id: 242,
    conditioned: ["battlecry"],

    battlecry(plr, game, self) {
        plr.heroPowerCost = 0;
    },

    condition(plr, game, self) {
        return game.functions.highlander(plr);
    }
}
