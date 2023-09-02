// Created by Hand

import { Card } from "../../../src/internal.js";
import { Blueprint, EventValue } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "DIY 3",
    desc: "&BThis is a DIY card, it does not work by default.&R Choose a minion to kill.",
    mana: 0,
    type: "Spell",
    spellClass: "General",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 64,

    cast(plr, game, self) {
        // Choose a minion to kill.

        // Try to:
        // 1. Ask the user which minion to kill.
        // 2. Kill that minion

        // I set the target to self, so that it is never null for the verification process. Pretend that it is null.
        let target = self;

        // The `target` variable needs to be set to the target, otherwise it will fail to verify the solution.
        function solution() {
            // Put all your code inside this function please.
            













        }

        // DON'T CHANGE ANYTHING BELOW THIS LINE
        // Also there are some spoilers about the solution in the verification process down below
        // so if you don't want to see it, don't scroll down






















































        // Testing your solution.
        let correctParameters = false;

        game.functions.addEventListener("TargetSelectionStarts", true, (_unknownVal) => {
            const val = _unknownVal as EventValue<"TargetSelectionStarts">;

            let [prompt, card, force_side, force_class, flags] = val;

            correctParameters = (
                card == self &&
                force_side == null &&
                force_class == "minion" &&
                flags.length == 0
            );

            return true;
        }, 1);

        solution();

        game.interact.verifyDIYSolution(
            target.getHealth() <= 0 &&
            correctParameters &&
            game.graveyard[plr.id].includes(target) || game.graveyard[plr.getOpponent().id].includes(target)
        , "3.ts");
    }
}

export default blueprint;
