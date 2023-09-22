// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Inf Mana",
    desc: "Fill up your mana. For the rest of the game, your mana never decreases.",
    cost: 0,
    type: "Spell",
    spellSchool: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 66,

    cast(plr, game, self) {
        // Fill up your mana. For the rest of the game, your mana never decreases.

        // Gain max mana every tick.
        // This lasts for the rest of the game, since we don't unhook it.
        game.functions.hookToTick(() => {
            plr.gainMana(plr.maxMana);
        });
    }
}