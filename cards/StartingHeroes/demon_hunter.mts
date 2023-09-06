// Created by the Custom Card Creator

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Demon Hunter Starting Hero",
    displayName: "Illidan Stormrage",
    desc: "Demon hunter starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Demon Hunter"],
    rarity: "Free",
    hpDesc: "+1 Attack this turn.",
    hpCost: 1,
    uncollectible: true,
    id: 13,

    heropower(plr, game, self) {
        // +1 Attack this turn.

        // Give the player +1 attack.
        plr.addAttack(1);
    }
}
