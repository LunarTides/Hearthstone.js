// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Tick Hook Example",
    stats: [1, 1],
    text: "Your cards cost (1) less.",
    cost: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 59,

    battlecry(plr, self) {
        // Your cards cost (1) less.

        // Ticks are called more often than passives
        // Passives get called when an event gets broadcast
        // Ticks get called when an event gets broadcast AND every game loop
        // So ticks might be better to use in some situations where you don't want it to be dependent on events (events can be suppressed),
        // or you want it to be triggered every game loop no matter what.
        
        // This returns a function that, when called, will remove the hook
        // You are given the key and value of the event, but i don't think you will need them for tick hooks,
        // since they are supposed to not be (dependent on / specific to certain) events, but you are free to use them if you want.
        const unhook = game.functions.event.hookToTick((key, _unknownVal) => {
            plr.hand.forEach(c => {
                if (c.enchantmentExists("-1 cost", self)) return;

                c.addEnchantment("-1 cost", self);
            });
        });

        // Store the unhook to be used later in the `remove` ability. This is the only supported way to transfer information between abilities.
        // You can store anything in a card, and it shouldn't be messed with by other cards / the game.
        // Speaking of, you should never mess with another card's storage since it can cause unexpected behavior.
        if (!self.storage.unhooks) self.storage.unhooks = [];
        self.storage.unhooks.push(unhook);
    },

    // Unhook from the tick when the card is removed
    remove(plr, self) {
        // Unhook from all ticks that the card is hooked to.
        // It is important to unhook before removing the enchantments, since removing the enchantments can cause a tick, which would add the enchantments back.
        if (self.storage.unhooks) self.storage.unhooks.forEach((unhook: Function) => unhook());

        // Undo the enchantments
        plr.hand.forEach(c => {
            c.removeEnchantment("-1 cost", self);
        });
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    }
}
