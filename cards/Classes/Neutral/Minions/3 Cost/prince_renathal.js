module.exports = {
    name: "Prince Renathal",
    stats: [3, 4],
    desc: "Your deck size is 40. Your starting Health is 35.",
    mana: 3,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Murder at Castle Nathria",
    settings: {
        maxDeckSize: 40,
        minDeckSize: 40
    },
    id: 197,

    startofgame(plr, game, self) {
        plr.maxHealth = 35;
        plr.health = plr.maxHealth;
    }
}
