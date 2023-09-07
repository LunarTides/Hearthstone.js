// Created by Hand

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Spell Example",
    desc: "Just an example card (Does nothing)",
    mana: 1,
    type: "Spell",

    // The spell school of the spell. If you don't include this line, it will not have a spell school.
    // You can delete this line, but not the `tribe` line in `minion.mts`.
    spellSchool: "Shadow",

    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 30,
}
