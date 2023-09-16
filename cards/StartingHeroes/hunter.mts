// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Hunter Starting Hero",
    displayName: "Rexxar",
    desc: "Hunter starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Hunter"],
    rarity: "Free",
    hpDesc: "Deal 2 damage to the enemy hero.",
    hpCost: 2,
    uncollectible: true,
    id: 6,

    heropower(plr, game, self) {
        // Deal 2 damage to the enemy hero.
        game.attack(2, plr.getOpponent());
    }
}
