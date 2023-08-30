// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "../src/types.js";

const blueprint: Blueprint = {
    name: "The Coin",
    desc: "Gain 1 Mana Crystal this turn only.",
    mana: 0,
    type: "Spell",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,
    id: 107,

    cast(plr, game, self) {
        plr.refreshMana(1, plr.maxMaxMana);
    }
}

export default blueprint;
