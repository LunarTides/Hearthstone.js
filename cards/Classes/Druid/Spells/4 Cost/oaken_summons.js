// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Oaken Summons",
    desc: "Gain 6 Armor. Recruit a minion that costs (4) or less.",
    mana: 4,
    type: "Spell",
    class: "Druid",
    rarity: "Epic",
    set: "Kobolds & Catacombs",
    spellClass: "Nature",
    id: 23,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        plr.armor += 6;

        let list = plr.deck.filter(c => c.mana <= 4);

        game.functions.recruit(plr, list);
    }
}
