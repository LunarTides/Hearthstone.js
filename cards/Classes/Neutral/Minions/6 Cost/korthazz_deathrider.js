// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Korthazz Deathrider",
    displayName: "Korth'azz, Deathrider",
    stats: [6, 6],
    desc: "&BRush. Deathrattle:&R If you had all four Horsemen die this game, destroy the enemy hero.",
    mana: 6,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Free",
    set: "March of the Lich King",
    keywords: ["Rush"],
    uncollectible: true,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        let card = new game.Card("Blaumeaux Faminerider", plr);
        card.activate("deathrattle");
    }
}
