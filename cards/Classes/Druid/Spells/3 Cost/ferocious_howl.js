// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Ferocious Howl",
    desc: "Draw a card. Gain 1 Armor for each card in your hand.",
    mana: 3,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "The Witchwood",
    id: 20,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        plr.drawCard();

        plr.armor += plr.hand.length;
    }
}
