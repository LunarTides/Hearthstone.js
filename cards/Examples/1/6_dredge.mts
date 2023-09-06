// Created by Hand

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Dredge Example",
    stats: [1, 1],
    desc: "&BDredge.&R This example card shows you how to use `Keyword Functions` like dredge.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 34,

    battlecry(plr, game, self) {
        // `game.interact` is an instance of the Interact object as defined in `src/interact.ts`.
        game.interact.dredge();
    }
}
