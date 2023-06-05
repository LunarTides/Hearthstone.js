// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Spectral Cutlass",
    stats: [2, 2],
    desc: "&BLifesteal.&R Whenever you play a card from another class, gain +1 Durability.",
    mana: 4,
    type: "Weapon",
    class: "Rogue",
    rarity: "Epic",
    set: "The Witchwood",
    keywords: ["Lifesteal"],
    id: 283,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "PlayCard" || val.plr != plr || val == self || game.functions.validateClass(plr, val)) return;

        // The card you played was from another class.
        self.addStats(0, 1);
    }
}
