module.exports = {
    name: "Blaumeaux Faminerider",
    displayName: "Blaumeaux, Faminerider",
    stats: [6, 6],
    desc: "&BLifesteal. Deathrattle:&R If you had all four Horsemen die this game, destroy the enemy hero.",
    mana: 6,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Free",
    set: "March of the Lich King",
    keywords: ["Lifesteal"],
    uncollectible: true,

    deathrattle(plr, game, self) {
        let stat = game.events.increment(plr, "rivendareCounter");

        if (stat < 4) return;

        game.endGame(plr);
    }
}
