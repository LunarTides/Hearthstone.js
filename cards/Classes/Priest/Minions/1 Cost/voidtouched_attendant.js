// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Voidtouched Attendant",
    stats: [1, 3],
    desc: "Both heroes take one extra damage from all sources.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Priest",
    rarity: "Epic",
    set: "United in Stormwind",
    id: 234,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "TakeDamage") return;

        let [player, amount] = val;

        player.remHealth(1, false);
    }
}
