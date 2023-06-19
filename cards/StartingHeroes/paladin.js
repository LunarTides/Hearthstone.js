// Created by the Custom Card Creator

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Paladin Starting Hero",
    displayName: "Uther Lightbringer",
    desc: "Paladin starting hero",
    mana: 0,
    type: "Hero",
    class: "Paladin",
    rarity: "Free",
    set: "Core",
    hpDesc: "Summon a 1/1 Silver Hand Recruit.",
    uncollectible: true,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        const card = new game.Card("Silver Hand Recruit", plr);

        game.summonMinion(card, plr);
    }
}
