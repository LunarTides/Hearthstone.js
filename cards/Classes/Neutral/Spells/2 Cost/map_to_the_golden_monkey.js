// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Map to the Golden Monkey",
    desc: "Shuffle the Golden Monkey into your deck. Draw a card.",
    mana: 2,
    type: "Spell",
    class: "Neutral",
    rarity: "Free",
    set: "The League of Explorers",
    uncollectible: true,
    id: 59,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        plr.shuffleIntoDeck(new game.Card("Golden Monkey", plr));

        plr.drawCard();
    }
}
