// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Soulbreaker",
    stats: [3, 2],
    desc: "After your hero attacks and kills a minion, gain 2 Corpses.",
    mana: 3,
    type: "Weapon",
    class: "Death Knight",
    rarity: "Common",
    set: "March of the Lich King",
    runes: "B",
    id: 15,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "Attack") return;

        let [attacker, target] = val;

        if (attacker != plr || target instanceof game.Player) return;
        if (target.getHealth() > 0) return;

        plr.corpses += 2;
    }
}
