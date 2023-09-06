// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Healing Totem",
    stats: [0, 2],
    // TODO: What does this hashtag mean? This was pulled from the vanilla card
    desc: "At the end of your turn, restore #1 Health to all friendly minions.",
    mana: 1,
    type: "Minion",
    tribe: "Totem",
    classes: ["Shaman"],
    rarity: "Free",
    uncollectible: true,
    id: 15,

    passive(plr, game, self, key, val) {
        // At the end of your turn, restore 1 Health to all friendly minions.

        // Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
        if (key != "EndTurn" || game.player != plr) return;

        // Restore 1 Health to all friendly minions
        game.board[plr.id].forEach(minion => {
            minion.addHealth(1, true);
        });
    }
}
