// Created by the Custom Card Creator

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Hunter Starting Hero",
    displayName: "Rexxar",
    desc: "Hunter starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Hunter"],
    rarity: "Free",
    hpDesc: "Deal 2 damage to the enemy hero.",
    uncollectible: true,
    id: 6,

    heropower(plr, game, self) {
        // Deal 2 damage to the enemy hero.
        game.attack(2, plr.getOpponent());
    }
}

export default blueprint;
