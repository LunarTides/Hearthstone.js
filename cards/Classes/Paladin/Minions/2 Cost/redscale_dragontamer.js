// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Redscale Dragontamer",
    stats: [2, 3],
    desc: "&BDeathrattle:&R Draw a Dragon.",
    mana: 2,
    type: "Minion",
    tribe: "Murloc",
    class: "Paladin",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    id: 258,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Minion" && game.functions.matchTribe(c.tribe, "Dragon"));
        let minion = game.functions.randList(list, false);
        if (!minion) return;

        plr.drawSpecific(minion);
    }
}
