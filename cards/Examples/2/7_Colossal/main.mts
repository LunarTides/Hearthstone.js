// Created by Hand

import { Blueprint } from "../../../../src/types.js";

const blueprint: Blueprint = {
    name: "Colossal Example",
    stats: [5, 3],
    desc: "Colossal +2. Dredge.",
    mana: 2,
    type: "Minion",
    tribe: "Beast",
    classes: ["Neutral"],
    rarity: "Free",

    // Put the names of the cards here. The "" is this card.
    //
    // The board will look like this (it uses their display names, if they have them):
    // Left Arm
    // Colossal Example
    // Right Arm
    colossal: ["Colossal Example Left Arm", "", "Colossal Example Right Arm"],

    uncollectible: true,
    id: 46,

    battlecry(plr, game) {
        game.interact.dredge();
    }
}

export default blueprint;
