// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Kobold Lackey",
    stats: [1, 1],
    desc: "Battlecry: Deal $2 damage.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 27,

    battlecry(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, self);
        if (!target) return -1;

        game.attack("$2", target);
        return true;
    }
}

export default blueprint;
