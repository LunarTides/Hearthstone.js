// Created by the Custom Card Creator

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Death Knight Starting Hero",
    displayName: "The Lich King",
    desc: "Death knight starting hero",
    mana: 0,
    type: "Hero",
    class: "Death Knight",
    rarity: "Free",
    set: "Core",
    hpDesc: "Summon a 1/1 Ghoul with Charge. It dies at end of turn.",
    uncollectible: true,
    id: 93,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        let minion = new game.Card("Death Knight Frail Ghoul", plr);

        game.summonMinion(minion, plr);
    }
}
