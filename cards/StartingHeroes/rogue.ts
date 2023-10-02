// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Rogue Starting Hero",
    displayName: "Valeera Sanguinar",
    text: "Rogue starting hero",
    cost: 0,
    type: "Hero",
    hpText: "Equip a 1/2 Dagger.",
    hpCost: 2,
    classes: ["Rogue"],
    rarity: "Free",
    uncollectible: true,
    id: 12,

    heropower(plr, self) {
        // Equip a 1/2 Dagger.

        // Create the weapon card
        const wpn = new game.Card("Wicked Knife", plr);

        // Equip the weapon
        plr.setWeapon(wpn);
    },

    test(plr, self) {
        const assert = game.functions.assert;

        // The player should not have a weapon
        assert(() => plr.weapon === undefined);
        self.activate("heropower");

        // The player should now have the wicked knife weapon
        assert(() => plr.weapon?.name === "Wicked Knife");
    }
}
