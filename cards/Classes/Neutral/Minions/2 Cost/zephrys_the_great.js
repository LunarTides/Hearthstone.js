// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Zephrys the Great",
    stats: [3, 2],
    desc: "Battlecry: If your deck has no duplicates, wish for the perfect card.",
    mana: 2,
    type: "Minion",
    tribe: "Elemental",
    class: "Neutral",
    rarity: "Legendary",
    set: "Saviors of Uldum",
    id: 168,
    conditioned: ["battlecry"],

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let list = game.functions.getCards().filter(c => c.set == "Legacy");

        // The real zephrys is a lot more complicated but i'm not gonna bother, sorry
        let card = game.interact.discover("Choose the perfect card.", list, false);
        if (!card) return -1;

        plr.addToHand(card);
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    condition(plr, game, self) {
        return game.functions.highlander(plr);
    }
}
