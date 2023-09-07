// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Ethereal Lackey",
    stats: [1, 1],
    desc: "&BBattlecry:&R &BDiscover&R a spell.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 24,

    battlecry(plr, game) {
        // Discover a spell.

        // Filter out all cards that aren't spells
        let list = game.functions.getCards().filter(c => c.type == "Spell");
        if (list.length <= 0) return;

        // Prompt a discover
        let card = game.interact.discover("Discover a spell.", list);
        if (!card) return game.constants.REFUND;

        // Add the card to the player's hand
        plr.addToHand(card);
        return true;
    }
}
