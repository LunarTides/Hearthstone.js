// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Stir the Stones",
    desc: "Questline: Play 3 cards with Overload. Reward: Summon a 3/3 Elemental with Taunt.",
    mana: 0,
    type: "Spell",
    class: "Shaman",
    rarity: "Legendary",
    set: "United in Stormwind",
    uncollectible: true,
    id: 75,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        game.functions.addQuest("Quest", plr, card, "GainOverload", 3, (val, turn, done) => {
            if (!done) return;
            
            game.summonMinion(new game.Card("Living Earth", plr), plr);
        }, "Tame the Flames");
    }
}
