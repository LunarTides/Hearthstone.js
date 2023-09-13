
// Created by Hand

import { Blueprint, EventValue } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "DIY 4",
    stats: [1, 10],
    desc: "<b>This is a DIY card, it does not work by default.</b> Whenever a friendly minion dies, Resurrect it with 1/1 stats.",
    mana: 0,
    type: "Minion",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 64,

    passive(plr, game, self, key, _unknownValue) {
        // Whenever a minion dies, Resurrect it with 1/1 stats.

        // If the key is for a different event, stop the function.
        if (!(key === "KillMinion")) return;

        // Here we cast the value to the correct type.
        // Do not use the '_unknownValue' variable after this.
        const val = _unknownValue as EventValue<typeof key>;

        // Don't change this line
        if (val.plr !== plr) return;

        // Try to:
        // 1. Resurrect the minion (val) with 1/1 stats.

        // THIS ONLY GETS VALIDATED ONCE A MINION DIES. PLEASE TRY TO CAUSE A MINION TO DIE IN ORDER TO VALIDATE YOUR SOLUTION













        // DON'T CHANGE ANYTHING BELOW THIS LINE
        // Also there are some spoilers about the solution in the verification process down below
        // so if you don't want to see it, don't scroll down






















































        // Testing your solution.
        if (self.storage.solved) return true;

        const solved = game.board[plr.id].some(card => {
            return (
                card.id === val.id &&
                card.type === val.type &&
                card.getAttack() === 1 &&
                card.getHealth() === 1 &&
                card.uuid !== val.uuid &&
                card.plr === plr
            );
        });

        game.interact.verifyDIYSolution(solved, "3.mts");
        if (!solved) plr.addToHand(self);

        self.storage.solved = true;
        return true;
    }
}
