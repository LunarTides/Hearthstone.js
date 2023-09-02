// Created by the Custom Card Creator

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
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
        plr.addAttack(1);
        plr.armor += 1;
    }
}

export default blueprint;
