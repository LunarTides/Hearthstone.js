// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Warrior Starting Hero",
    displayName: "Garrosh Hellscream",
    desc: "Warrior starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Warrior"],
    rarity: "Free",
    hpDesc: "Gain 2 Armor.",
    hpCost: 2,
    uncollectible: true,
    id: 7,

    heropower(plr, game, self) {
        // Gain 2 Armor.

        // Give the player +2 armor.
        // CARDTODO: Maybe there should be an `addArmor` function?
        plr.armor += 2;
    }
}
