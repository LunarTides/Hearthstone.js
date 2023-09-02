// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Dormant Example",
    stats: [8, 8],
    desc: "&RDormant&R for 2 turns.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    dormant: 2, // How many turns this minion should be dormant for.
    uncollectible: true,
    id: 39,

    battlecry(plr, game, self) {
        // The battlecry only triggers when the minion is no longer dormant.
        game.interact.dredge();
    }
}

export default blueprint;
