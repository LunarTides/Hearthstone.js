// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Truesilver Champion",
    stats: [4, 2],
    desc: "Whenever your hero attacks, restore 2 Health to it.",
    mana: 4,
    type: "Weapon",
    class: "Paladin",
    rarity: "Free",
    set: "Legacy",
    id: 263,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "Attack") return

        const [attacker, target] = val;
        if (attacker != plr) return;

        plr.addHealth(2);
    }
}
