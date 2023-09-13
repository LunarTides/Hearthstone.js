// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Location Example",

    // The attack is set to 0 when you play the card so it doesn't matter.
    // The health is now the amount of times you can trigger the location card before it breaking.
    stats: [1, 3],

    desc: "Restore 2 Health to your hero.",
    mana: 1,
    type: "Location",
    classes: ["Neutral"],
    rarity: "Free",

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
    }
}
