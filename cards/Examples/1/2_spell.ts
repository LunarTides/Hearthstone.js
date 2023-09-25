// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Spell Example",
    text: "Just an example card (Does nothing)",
    cost: 1,
    type: "Spell",

    // The spell school of the spell.
    spellSchool: "Shadow",

    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 30
}
