// Created by the Custom Card Creator

import { Blueprint } from "../../src/types.js";

export const blueprint: Blueprint = {
    name: "Druid Starting Hero",
    displayName: "Malfurion Stormrage",
    desc: "Druid starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Druid"],
    rarity: "Free",
    hpDesc: "+1 Attack this turn. +1 Armor.",
    uncollectible: true,
    id: 5,

    heropower(plr, game, self) {
        // +1 Attack this turn. +1 Armor.

        // Give the player +1 attack.
        plr.addAttack(1);

        // Give the player +1 armor.
        // CARDTODO: Maybe there should be an `addArmor` function?
        plr.armor += 1;
    }
}
