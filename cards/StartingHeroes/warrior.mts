// Created by the Custom Card Creator

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Warrior Starting Hero",
    displayName: "Garrosh Hellscream",
    desc: "Warrior starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Warrior"],
    rarity: "Free",
    hpDesc: "Gain 2 Armor.",
    uncollectible: true,
    id: 7,

    heropower(plr, game, self) {
        plr.armor += 2;
    }
}

export default blueprint;
