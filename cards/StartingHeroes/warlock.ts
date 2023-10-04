// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Warlock Starting Hero",
    displayName: "Gul'dan",
    text: "Warlock starting hero",
    cost: 0,
    type: "Hero",
    hpText: "Draw a card and take 2 damage.",
    hpCost: 2,
    classes: ["Warlock"],
    rarity: "Free",
    uncollectible: true,
    id: 11,

    heropower(plr, self) {
        // Draw a card and take 2 damage.

        // Deal 2 damage to the player.
        // CARDTODO: Should this use `game.attack(2, plr)` instead? Is the order correct?
        plr.remHealth(2);
        plr.drawCard();
    },

    test(plr, self) {
        const assert = game.functions.error.assert;

        // Clear the player's hand
        plr.hand = [];

        // The player should have no cards in their hand, and should have 30 health
        assert(() => plr.hand.length === 0);
        assert(() => plr.health === 30);

        self.activate("heropower");

        // The player should now have 1 card in their hand, and 28 health.
        assert(() => plr.hand.length === 1);
        assert(() => plr.health === 30 - 2);
    }
}
