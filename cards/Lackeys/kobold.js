// Created by Hand (before the Card Creator Existed)

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Kobold Lackey",
    stats: [1, 1],
    desc: "Battlecry: Deal $2 damage.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",
    uncollectible: true,
    id: 91,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, self);
        if (!target) return -1;

        game.attack("$2", target);
    }
}
