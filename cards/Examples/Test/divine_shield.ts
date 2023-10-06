// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Divine Shield Test",
    stats: [1, 1],
    text: "<b>Divine Shield</b>",
    cost: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 73,

    create(plr, self) {
        self.addKeyword("Divine Shield");
    },

    test(plr, self) {
        const assert = game.functions.util.assert;

        // There should be no minions on the board
        assert(() => game.board[plr.id].length === 0);

        // There should be 1 minion on the board
        game.summonMinion(self, plr);
        assert(() => game.board[plr.id].length === 1);

        // There should be 1 minion on the board since the divine shield saves it
        game.attack(9999, self);
        assert(() => game.board[plr.id].length === 1);

        // There should be no minions on the board since the divine shield is gone
        game.attack(9999, self);
        assert(() => game.board[plr.id].length === 0);
    }
}
