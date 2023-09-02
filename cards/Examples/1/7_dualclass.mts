// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Dual-Class Example",
    stats: [1, 1],
    desc: "This is an example card showing how to make a card with multiple classes.",
    mana: 1,
    type: "Minion",
    tribe: "None",

    // You seperate the classes like this. You should be able to just keep adding more and more classes.
    classes: ["Shaman", "Warrior"],

    rarity: "Free",
    uncollectible: true,
    id: 35,
}

export default blueprint;
