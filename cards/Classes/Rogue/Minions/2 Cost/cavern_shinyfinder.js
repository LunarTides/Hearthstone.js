// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Cavern Shinyfinder",
    stats: [3, 1],
    desc: "&BBattlecry: &RDraw a weapon from your deck.",
    mana: 2,
    type: "Minion",
    tribe: "None",
    class: "Rogue",
    rarity: "Common",
    set: "Kobolds & Catacombs",
    id: 277,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let weapons = plr.deck.filter(c => c.type == "Weapon");
        let weapon = game.functions.randList(weapons, false);
        if (!weapon) return;

        plr.drawSpecific(weapon);
    }
}
