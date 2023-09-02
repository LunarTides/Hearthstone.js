// Created by the Custom Card Creator

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Warlock Starting Hero",
    displayName: "Gul'dan",
    desc: "Warlock starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Warlock"],
    rarity: "Free",
    hpDesc: "Draw a card and take 2 damage.",
    uncollectible: true,
    id: 11,

    heropower(plr, game, self) {
        plr.remHealth(2);
        plr.drawCard();
    }
}

export default blueprint;