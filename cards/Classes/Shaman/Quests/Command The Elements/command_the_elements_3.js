// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Tame the Flames",
    desc: "Questline: Play 3 cards with Overload. Reward: Stormcaller Bru'kan.",
    mana: 0,
    type: "Spell",
    class: "Shaman",
    rarity: "Legendary",
    set: "United in Stormwind",
    uncollectible: true,
    id: 76,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        game.functions.addQuest("Quest", plr, card, "GainOverload", 3, (val, turn, done) => {
            if (!done) return;

            plr.addToHand(new game.Card("Stormcaller Bru'kan", plr));
        });
    }
}
