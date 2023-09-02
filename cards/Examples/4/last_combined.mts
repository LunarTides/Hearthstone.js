// Created by Hand

import { Blueprint, EventValue } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Combined Example 4",
    desc: "Quest: Play 3 cards. Reward: Reduce the cost of the next 10 Minions you play by 1.",
    mana: 1,
    type: "Spell",
    classes: ["Neutral"],
    rarity: "Legendary",
    uncollectible: true,
    id: 61,

    cast(plr, game, self) {
        game.functions.addQuest("Quest", plr, self, "PlayCard", 3, (_unknownVal, done) => {
            const val = _unknownVal as EventValue<"PlayCard">;

            if (val == self) return false;
            if (!done) return true;

            // The quest is done.
            // Add the `-1 mana` enchantment constantly
            let unhook = game.functions.hookToTick(() => {
                plr.hand.filter(c => c.type == "Minion").forEach(m => {
                    if (m.enchantmentExists("-1 mana", self)) return;

                    m.addEnchantment("-1 mana", self);
                });
            });

            // Add an event listener to check if you've played 10 cards
            let amount = 0;

            game.functions.addEventListener("PlayCard", _unknownVal => {
                const val = _unknownVal as EventValue<"PlayCard">

                return game.player == plr && val.type == "Minion";
            }, () => {
                // Every time you play a minion, increment `amount` by 1.
                amount++;

                if (amount < 10) return;

                unhook(); // Destroy the tick hook

                // Reverse the enchantent
                plr.hand.filter(c => c.type == "Minion").forEach(m => {
                    m.removeEnchantment("-1 mana", self);
                });

                // Destroy this event listener
                return true;
            }, -1);

            return true;
        });
    }
}

export default blueprint;
