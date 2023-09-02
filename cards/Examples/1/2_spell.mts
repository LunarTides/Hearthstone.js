// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Spell Example",
    desc: "Just an example card (Does nothing)",
    mana: 1,
    type: "Spell",
    spellClass: "Shadow", // The spell school of the spell. If you don't include this line, it will not have a spell school. You can delete this line, but not the `tribe` line in `minion.ts`.
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 30,
}

export default blueprint;
