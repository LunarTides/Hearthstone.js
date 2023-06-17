// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Aquatic Form",
    desc: "Dredge. If you have the Mana to play the card this turn, draw it.",
    mana: 0,
    type: "Spell",
    class: "Druid",
    rarity: "Rare",
    set: "Voyage to the Sunken City",
    id: 9,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        let c = game.interact.dredge();
        if (!c) return;

        if (plr.mana >= c.mana) {
            plr.drawCard();
        }
    }
}
