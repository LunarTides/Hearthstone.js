// Created by Hand

import { Blueprint } from "../../../src/types.js";

export const blueprint: Blueprint = {
    name: "Location Example",

    // The attack is set to 0 when you play the card.
    // The health is now the amount of times you can trigger the location card before it breaking.
    stats: [1, 3],

    desc: "Restore 2 health to your hero.",
    mana: 1,
    type: "Location",
    classes: ["Neutral"],
    rarity: "Free",

    // How many turns you have to wait until you can use the location card again.
    // Afaik, in hearthstone, this is always 2.
    cooldown: 2,

    uncollectible: true,
    id: 37,

    use(plr, game, self) {
        // Heal this card's owner by 2.
        plr.addHealth(2);
    }
}
