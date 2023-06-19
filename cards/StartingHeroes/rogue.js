// Created by the Custom Card Creator

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Rogue Starting Hero",
    displayName: "Valeera Sanguinar",
    desc: "Rogue starting hero",
    mana: 0,
    type: "Hero",
    class: "Rogue",
    rarity: "Free",
    set: "Core",
    hpDesc: "Equip a 1/2 Dagger.",
    uncollectible: true,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        const wpn = new game.Card("Wicked Knife", plr);

        plr.setWeapon(wpn);
    }
}
