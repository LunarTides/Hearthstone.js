// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Prince Renathal",
    stats: [3, 4],
    desc: "Your deck size is 40. Your starting Health is 35.",
    mana: 3,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Murder at Castle Nathria",
    settings: {
        maxDeckLength: 40,
        minDeckLength: 40
    },
    id: 197,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    startofgame(plr, game, self) {
        plr.maxHealth = 35;
        plr.health = plr.maxHealth;
    }
}
