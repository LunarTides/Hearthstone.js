module.exports = {
    name: "Zeliek Conquestrider",
    displayName: "Zeliek, Conquestrider",
    stats: [6, 6],
    desc: "&BTaunt. Deathrattle:&R If you had all four Horsemen die this game, destroy the enemy hero.",
    mana: 6,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Free",
    set: "March of the Lich King",
    keywords: ["Taunt"],
    uncollectible: true,

    deathrattle(plr, game, self) {
        let card = new game.Card("Blaumeaux Faminerider", plr);
        card.activate("deathrattle");
    }
}
