module.exports = {
    name: "Korthazz Deathrider",
    displayName: "Korth'azz, Deathrider",
    stats: [6, 6],
    desc: "&BRush. Deathrattle:&R If you had all four Horsemen die this game, destroy the enemy hero.",
    mana: 6,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Free",
    set: "March of the Lich King",
    keywords: ["Rush"],
    uncollectible: true,

    deathrattle(plr, game, self) {
        let card = new game.Card("Blaumeaux Faminerider", plr);
        card.activate("deathrattle");
    }
}
