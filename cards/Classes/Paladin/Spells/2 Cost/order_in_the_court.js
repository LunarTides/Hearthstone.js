// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Order in the Court",
    desc: "Reorder your deck from highest Cost to lowest Cost. Draw a card.",
    mana: 2,
    type: "Spell",
    class: "Paladin",
    rarity: "Rare",
    set: "Maw and Disorder",
    id: 257,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        // What black magic is this?? Code "borrowed" from: https://stackoverflow.com/questions/8092776/how-to-sort-list-of-dicts-in-js
        plr.deck = plr.deck.sort((one, two) => {
            return one.mana - two.mana;
        });

        plr.drawCard();
    }
}
