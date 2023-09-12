// Created by Hand

import { Card } from "@Game/internal.js";
import { Blueprint, EventValue } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "DIY 3",
    desc: "<bold>This is a DIY card, it does not work by default.</bold> Choose a minion to kill.",
    mana: 0,
    type: "Spell",
    spellSchool: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 63,

    cast(plr, game, self) {
        // Choose a minion to kill.

        // Try to:
        // 1. Ask the user which minion to kill.
        // 2. Kill that minion

        function solution() {
            // Put all your code inside this function please.
            













        }

        // DON'T CHANGE ANYTHING BELOW THIS LINE
        // Also there are some spoilers about the solution in the verification process down below
        // so if you don't want to see it, don't scroll down






















































        // Testing your solution.
        // TODO: All this code is bad. Please fix it.
        let target = self;
        let correctParameters = false;
        let potentiallyCancelled = false;

        // Make sure the parameters are correct
        game.functions.addEventListener("TargetSelectionStarts", (_unknownVal) => {
            const val = _unknownVal as EventValue<"TargetSelectionStarts">;

            // Don't check for `prompt` since there is no correct prompt
            let [prompt, card, force_side, force_class, flags] = val;

            correctParameters = (
                card == self &&
                force_side == "any" &&
                force_class == "minion" &&
                flags.length == 0
            );

            // The `TargetSelectionStarts` event fired. This means that the card has a chance of being cancelled.
            potentiallyCancelled = true;

            return "destroy";
        }, 1);

        // Find the target
        game.functions.addEventListener("TargetSelected", (_unknownVal) => {
            const val = _unknownVal as EventValue<"TargetSelected">;

            if (!(val[0] === self)) return false;

            // At this point we know that the card wasn't cancelled, since the `TargetSelected` event doesn't fire if the card is cancelled
            target = val[1] as Card;
            potentiallyCancelled = false;

            return "destroy";
        }, 1);

        solution();

        // This only happens if the `TargetSelectionStarts` event fired, but not `TargetSelected`.
        // That only happens if the card was cancelled after the `TargetSelectionStarts` event fired
        if (potentiallyCancelled) {
            game.input("You cancelled the card. The verification process depends on a minion actually being killed. Try again.\n");
            return game.constants.REFUND;
        }

        let solved = (
            target !== self &&
            target.getHealth() <= 0 &&
            correctParameters &&
            game.graveyard.some(p => p.includes(target))
        );

        game.interact.verifyDIYSolution(solved, "3.mts");

        if (!solved) return game.constants.REFUND;
        return true;
    }
}
