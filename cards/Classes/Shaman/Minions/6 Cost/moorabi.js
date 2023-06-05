// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Moorabi",
    stats: [4, 4],
    desc: "Whenever another minion is &BFrozen&R, add a copy of it to your hand.",
    mana: 6,
    type: "Minion",
    tribe: "None",
    class: "Shaman",
    rarity: "Legendary",
    id: 315,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "FreezeCard") return;
        if (val == self) return;

        let copy = new game.Card(val.name, plr);
        plr.addToHand(copy);
    }
}
