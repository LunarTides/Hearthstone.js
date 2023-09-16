// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Warlock Starting Hero",
    displayName: "Gul'dan",
    desc: "Warlock starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Warlock"],
    rarity: "Free",
    hpDesc: "Draw a card and take 2 damage.",
    hpCost: 2,
    uncollectible: true,
    id: 11,

    heropower(plr, game, self) {
        // Draw a card and take 2 damage.

        // Deal 2 damage to the player.
        // CARDTODO: Should this use `game.attack(2, plr)` instead? Is the order correct?
        plr.remHealth(2);
        plr.drawCard();
    }
}
