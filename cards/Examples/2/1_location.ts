// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Location Example",
    desc: "Restore 2 Health to your hero.",
    cost: 1,
    type: "Location",
    classes: ["Neutral"],
    rarity: "Free",

    // This is the amount of times you can trigger the location card before it breaking.
    durability: 3,

    // How many turns you have to wait until you can use the location card again.
    // Afaik, in hearthstone, this is always 2.
    cooldown: 2,

    uncollectible: true,
    id: 36,

    // Remember to use the correct ability
    // For spells, the ability is `cast`.
    // And for location cards, the ability is `use`.
    use(plr, game, self) {
        // Restore 2 Health to your hero.

        plr.addHealth(2);
    },

    test(plr, game, self) {
        plr.health = 1;
        
        self.activate("use");

        return plr.health = 1 + 2;
    }
}
