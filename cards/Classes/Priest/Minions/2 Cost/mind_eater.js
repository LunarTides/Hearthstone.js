// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Mind Eater",
    stats: [3, 2],
    desc: "&BDeathrattle:&R Add a copy of a card in your opponent's deck to your hand.",
    mana: 2,
    type: "Minion",
    tribe: "Undead",
    class: "Priest",
    rarity: "Common",
    set: "March of the Lich King",
    id: 235,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        let list = plr.getOpponent().deck;
        let card = game.functions.randList(list);

        plr.addToHand(card);
    }
}
