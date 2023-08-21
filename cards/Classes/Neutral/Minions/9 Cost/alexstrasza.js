// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Alexstrasza",
    stats: [8, 8],
    desc: "Battlecry: Set a hero's remaining Health to 15.",
    mana: 9,
    type: "Minion",
    tribe: "Dragon",
    class: "Neutral",
    rarity: "Legendary",
    set: "Legacy",
    id: 55,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Set a hero's remaining Health to 15.", self, null, "hero");
        if (!target) return -1;

        target.health = 15;
    }
}
