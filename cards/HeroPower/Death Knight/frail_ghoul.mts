// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Death Knight Frail Ghoul",
    displayName: "Frail Ghoul",
    stats: [1, 1],
    desc: "&BCharge&R At the end of your turn, this minion dies.",
    mana: 1,
    type: "Minion",
    tribe: "Undead",
    classes: ["Death Knight"],
    rarity: "Free",
    keywords: ["Charge"],
    uncollectible: true,
    id: 23,

    passive(plr, game, self, key, val) {
        // At the end of your turn, this minion dies.

        // Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
        if (key != "EndTurn" || game.player != plr) return;

        // Kill this minion
        self.kill();
    }
}
