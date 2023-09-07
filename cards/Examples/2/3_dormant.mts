// Created by Hand

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Dormant Example",
    stats: [8, 8],
    desc: "&BDormant&R for 2 turns. &BBattlecry:&R Dredge.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",

    // How many turns this minion should be dormant for.
    // Full disclosure: The dormant system is one of the most untested parts of this game, and might be rewritten in the future.
    dormant: 2,

    uncollectible: true,
    id: 38,

    // The battlecry only triggers when the minion is no longer dormant.
    battlecry(plr, game, self) {
        game.interact.dredge();
    }
}
