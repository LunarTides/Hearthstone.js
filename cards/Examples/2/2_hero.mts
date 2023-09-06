// Created by Hand

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Hero Example",
    desc: "Battlecry: Restore your hero to full health.",
    mana: 1,
    type: "Hero",
    classes: ["Neutral"],
    rarity: "Free",

    // The hero power's description
    hpDesc: "Restore 2 Health to your hero.",

    // How much mana the hero power costs to use.
    hpCost: 2,

    uncollectible: true,
    id: 38,

    battlecry(plr, game, self) {
        // Heal this card's owner to full health.
        // The `addHealth` method automatically caps the health of the player, so you don't need to worry.
        plr.addHealth(plr.maxHealth);
    },

    // This gets triggered when the player uses their hero power.
    // This only gets triggered if the player uses the hero power of this card, not any other hero power.
    // If you want something to happen every time any hero power is used, you'll have to use `passive`, which is explained in `4-1`.
    heropower(plr, game, self) {
        plr.addHealth(2);
    }
}
