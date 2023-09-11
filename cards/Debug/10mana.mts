// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "10 Mana",
    desc: "Gain 10 Mana.",
    mana: 0,
    type: "Spell",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 65,

    cast(plr, game, self) {
        // Gain 10 Mana.
        plr.gainMana(10);
    }
}
