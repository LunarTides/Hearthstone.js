// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Combined Example 3",
    text: "If the turn counter is an even number, gain mana equal to the turn counter (up to 10). Manathirst (7): Remove the condition. (Currently: {0})",
    cost: 0,
    type: "Spell",
    spellSchool: "None",
    classes: ["Neutral"],
    rarity: "Legendary",
    // The cast ability is conditioned
    conditioned: ["cast"],
    uncollectible: true,
    id: 54,

    cast(plr, game, self) {
        // If the turn counter is an even number, gain mana equal to the turn counter (up to 10).

        let turns = Math.ceil(game.turns / 2);

        // Cap the turn counter at 10
        if (turns > 10) turns = 10;

        plr.gainMana(turns);
    },

    condition(plr, game, self) {
        let turns = Math.ceil(game.turns / 2);
        if (turns > 10) turns = 10;

        // `turns` % 2 will always return 0 if it is an even number, and always return 1 if it is an odd number.
        let even = (turns % 2 == 0);
        let manathirst = self.manathirst(7);

        // If the turn counter is an even number or the manathirst is fullfilled, clear the condition.
        return even || manathirst;
    },

    placeholders(plr, game, self) {
        let turns = Math.ceil(game.turns / 2);
        if (turns > 10) turns = 10;

        return {0: turns};
    },

    test(plr, game, self) {
        // TODO: Add proper tests
        return true;
    }
}
