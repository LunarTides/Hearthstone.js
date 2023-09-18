// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "The Coin",
    desc: "Gain 1 Mana Crystal this turn only.",
    cost: 0,
    type: "Spell",
    spellSchool: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 2,

    cast(plr, game, self) {
        // Gain 1 Mana Crystal this turn only.

        // Refresh 1 mana, while not going over the player's max (max mana). In most cases, the max max mana is 10.
        // This is to prevent the player from having more than 10* mana, instead of preventing them from having more than max mana, which
        // is the thing that goes up every turn until it reaches 10*
        plr.refreshMana(1, plr.maxMaxMana);
    }
}
