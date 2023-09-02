// Created by the Custom Card Creator

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Death Knight Frail Ghoul",
    displayName: "Frail Ghoul",
    stats: [1, 1],
    desc: "Charge. At the end of your turn, this minion dies.",
    mana: 1,
    type: "Minion",
    tribe: "Undead",
    classes: ["Death Knight"],
    rarity: "Free",
    keywords: ["Charge"],
    uncollectible: true,
    id: 23,

    passive(plr, game, self, key, val) {
        if (key != "EndTurn" || game.player != plr) return;

        self.kill();
    }
}

export default blueprint;
