// Created by Hand

import { Blueprint, EventValue } from "@Game/types.js";

// This is the big one
export const blueprint: Blueprint = {
    name: "Combined Example 4",
    desc: "Quest: Play 3 cards. Reward: Reduce the cost of the next 10 Minions you play by 1.",
    cost: 1,
    type: "Spell",
    spellSchool: "None",
    classes: ["Neutral"],
    rarity: "Legendary",
    uncollectible: true,
    id: 60,

    cast(plr, game, self) {
        game.functions.addQuest("Quest", plr, self, "PlayCard", 3, (_unknownVal, done) => {
            const val = _unknownVal as EventValue<"PlayCard">;

            if (!(val !== self)) return false;
            if (!done) return true;

            // The quest is done.
            // Add the `-1 cost` enchantment constantly
            let unhook = game.functions.hookToTick(() => {
                // Only add the enchantment to minions
                plr.hand.filter(card => card.type == "Minion").forEach(minion => {
                    if (minion.enchantmentExists("-1 cost", self)) return;

                    minion.addEnchantment("-1 cost", self);
                });
            });

            // Add an event listener to check if you've played 10 cards
            let amount = 0;

            game.functions.addEventListener("PlayCard", _unknownVal => {
                const val = _unknownVal as EventValue<"PlayCard">

                // Only continue if the player that triggered the event is this card's owner and the played card is a minion.
                if (!(game.player === plr && val.type === "Minion")) return false;

                // Every time YOU play a MINION, increment `amount` by 1.
                amount++;

                // If `amount` is less than 10, don't do anything. Return true since it was a success
                if (amount < 10) return true;

                // You have now played 10 minions

                // Destroy the tick hook
                unhook();

                // Reverse the enchantment
                // You might be able to just do `plr.hand.forEach(m => ...)` instead, since `removeEnchantment` only removes enchantments if it's there.
                plr.hand.filter(c => c.type == "Minion").forEach(m => {
                    m.removeEnchantment("-1 cost", self);
                });

                // Destroy this event listener so it doesn't run again
                return "destroy";
            }, -1); // The event listener shouldn't destruct on its own, and should only be manually destroyed.

            // The quest event was a success. The game will remove this quest from the player.
            return true;
        });
    },

    test(plr, game, self) {
        // TODO: Add proper tests
        return true;
    }
}
