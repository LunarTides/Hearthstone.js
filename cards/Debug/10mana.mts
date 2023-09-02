// Created by Hand

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "10 Mana",
    desc: "Set your mana to 10.",
    mana: 0,
    type: "Spell",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 65,

    cast(plr, game, self) {
        plr.gainMana(10, true);
    }
}

export default blueprint;