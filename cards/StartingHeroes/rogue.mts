// Created by the Custom Card Creator

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Rogue Starting Hero",
    displayName: "Valeera Sanguinar",
    desc: "Rogue starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Rogue"],
    rarity: "Free",
    hpDesc: "Equip a 1/2 Dagger.",
    uncollectible: true,
    id: 12,

    heropower(plr, game, self) {
        const wpn = new game.Card("Wicked Knife", plr);

        plr.setWeapon(wpn);
    }
}

export default blueprint;
