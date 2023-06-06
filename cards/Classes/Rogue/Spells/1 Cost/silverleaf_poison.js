// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Silverleaf Poison",
    desc: "Give your weapon \"After your hero attacks, draw a card.\"",
    mana: 1,
    type: "Spell",
    class: "Rogue",
    rarity: "Common",
    set: "Forged in the Barrens",
    spellClass: "Nature",
    id: 275,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        if (!plr.weapon) return -1;

        if (!plr.weapon.passive) {
            plr.weapon.passive = [];
        }

        plr.weapon.passive.push((plr, game, self, key, val) => {
            if (key != "Attack") return

            const [attacker, target] = val
            if (attacker != plr) return;

            plr.drawCard();
        });
    }
}
