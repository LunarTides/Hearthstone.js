// Created by the Custom Card Creator

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
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
        plr.addAttack(1);
    }
}

export default blueprint;
