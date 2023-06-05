// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Sleetbreaker",
    stats: [3, 2],
    desc: "&BBattlecry:&R Add a Windchill to your hand.",
    mana: 2,
    type: "Minion",
    tribe: "Elemental",
    class: "Shaman",
    rarity: "Rare",
    id: 308,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let card = new game.Card("Windchill", plr);

        plr.addToHand(card);
    }
}
