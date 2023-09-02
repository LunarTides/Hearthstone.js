// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Goblin Lackey",
    stats: [1, 1],
    desc: "Battlecry: Give a friendly minion +1 Attack and Rush.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 26,

    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Give a friendly minion +1 Attack and Rush", self, "friendly", "minion");
        if (!target || !(target instanceof game.Card)) return -1;

        target.addStats(1, 0);
        target.addKeyword("Rush");
        return true;
    }
}

export default blueprint;
