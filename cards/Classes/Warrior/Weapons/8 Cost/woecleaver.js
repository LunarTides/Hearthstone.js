// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Woecleaver",
    stats: [3, 3],
    desc: "After your hero attacks, Recruit a minion.",
    mana: 8,
    type: "Weapon",
    class: "Warrior",
    rarity: "Legendary",
    set: "Kobolds & Catacombs",
    id: 131,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "Attack") return;

        const [attacker, target] = val;
        if (attacker != plr) return;

        game.functions.recruit(plr);
    }
}
