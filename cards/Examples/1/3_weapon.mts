// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    // This looks like a minion card except for the type.
    name: "Weapon Example",
    stats: [5, 3],
    desc: "Just an example card (Does nothing)",
    mana: 1,
    type: "Weapon",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 31,
}
