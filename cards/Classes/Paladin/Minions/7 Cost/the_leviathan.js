// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "The Leviathan",
    stats: [4, 5],
    desc: "&BColossal +1. Rush, Divine Shield&R. After this attacks, &BDredge&R.",
    mana: 7,
    type: "Minion",
    tribe: "Mech",
    class: "Paladin",
    rarity: "Legendary",
    set: "Voyage to the Sunken City",
    keywords: ["Rush", "Divine Shield"],
    colossal: ["", "The Leviathan Claw"],
    id: 269,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "Attack") return;

        const [attacker, target] = val;
        if (attacker != self) return;

        game.interact.dredge();
    }
}
