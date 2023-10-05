// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Hero Example",
    text: "<b>Battlecry:</b> Restore your hero to full health.",
    cost: 1,
    type: "Hero",
    classes: ["Neutral"],
    rarity: "Free",

    // The hero power's description
    hpText: "Restore 2 Health to your hero.",

    // How much mana the hero power costs to use.
    hpCost: 2,

    uncollectible: true,
    id: 37,

    battlecry(plr, self) {
        // Restore your hero to full health.

        // Heal this card's owner to full health.
        // The `addHealth` method automatically caps the health of the player, so you don't need to worry.
        plr.addHealth(plr.maxHealth);
    },

    // This gets triggered when the player uses their hero power.
    // This only gets triggered if the player uses the hero power of this card, not any other hero power.
    // If you want something to happen every time any hero power is used, you'll have to use `passive`, which is explained in `4-1`.
    heropower(plr, self) {
        // Restore 2 Health to your hero.

        plr.addHealth(2);
    },

    test(plr, self) {
        const assert = game.functions.util.assert;
        // Here we test both abilities
        
        // Test battlecry
        plr.health = 1;
        self.activate("battlecry");
        assert(() => plr.health === plr.maxHealth);

        // Test hero power
        plr.health = 1;
        self.activate("heropower");
        assert(() => plr.health === 1 + 2);
    }
}
