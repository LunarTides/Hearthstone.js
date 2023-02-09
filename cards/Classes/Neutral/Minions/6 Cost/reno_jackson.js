module.exports = {
    name: "Reno Jackson",
    stats: [4, 6],
    desc: "Battlecry: If your deck has no duplicates, fully heal your hero.",
    mana: 6,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "League of Explorers",
    id: 157,

    battlecry(plr, game, self) {
        if (!game.functions.highlander(plr)) return;

        plr.health = plr.maxHealth;
    }
}
