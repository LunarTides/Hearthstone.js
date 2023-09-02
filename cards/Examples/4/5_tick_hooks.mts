// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Tick Hook Example",
    stats: [1, 1],
    desc: "Your cards cost (1) less.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 60,

    battlecry(plr, game, self) {
        // Ticks are called more often than passives
        // Passives get called when an event gets broadcast
        // Ticks get called when an event gets broadcast AND every game loop
        // So ticks might be better to use in some situations where you don't want it to be dependent on events,
        // or you want it to be triggered every game loop no matter what.
        
        // This returns a function that, when called, will remove the hook
        let unhook = game.functions.hookToTick(() => {
            plr.hand.forEach(c => {
                if (c.enchantmentExists("-1 mana", self)) return;

                c.addEnchantment("-1 mana", self);
            });
        });

        // Store the unhook to be used later
        self.storage.push(unhook);
    },

    unpassive(plr, game, self, ignore) {
        if (ignore) return;

        // Unhook from the tick
        self.storage.forEach((unhook: Function) => unhook());

        // Undo the enchantment
        plr.hand.forEach(c => {
            c.removeEnchantment("-1 mana", self);
        });
    }
}

export default blueprint;
