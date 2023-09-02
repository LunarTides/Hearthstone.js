// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "../../../../src/types.js";

const blueprint: Blueprint = {
    name: "Strength Totem",
    stats: [0, 2],
    desc: "At the end of your turn, give another friendly minion +1 Attack.",
    mana: 1,
    type: "Minion",
    tribe: "Totem",
    classes: ["Shaman"],
    rarity: "Free",
    uncollectible: true,
    id: 18,

    passive(plr, game, self, key, val) {
        if (key != "EndTurn" || game.player != plr) return;

        var t = game.board[plr.id];

        if (t.length > 0) {
            t[game.functions.randInt(0, t.length - 1)].addStats(1, 0);
        }
    }
}

export default blueprint;
