module.exports = {
    name: "Raza the Chained",
    stats: [5, 5],
    desc: "&BBattlecry:&R If your deck has no duplicates, your Hero Power costs (0) this game.",
    mana: 5,
    tribe: "None",
    class: "Priest",
    rarity: "Legendary",
    set: "Mean Streets of Gadgetzan",
    id: 242,

    battlecry(plr, game, self) {
        if (!game.functions.highlander(plr)) return;

        plr.heroPowerCost = 0;
    }
}
