// Created by Hand

/**
 * @type {import("../../../src/types").Blueprint}
 */
module.exports = {
    name: "DIY 3",
    desc: "&BThis is a DIY card, it does not work by default.&R Choose a minion to kill.",
    mana: 0,
    type: "Spell",
    spellClass: "General",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    /**
     * @type {import("../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        // Choose a minion to kill.

        // Try to:
        // 1. Ask the user which minion to kill.
        // 2. Kill that minion

        let target;

        // The `target` variable needs to be set to the target, otherwise it will fail to verify the solution.
        function solution() {
            // Put all your code inside this function please.
            













        }

        // DON'T CHANGE ANYTHING BELOW THIS LINE
        // Also there are some spoilers about the solution in the verification process down below
        // so if you don't want to see it, don't scroll down






















































        // Testing your solution.
        let correctParameters = false;

        game.functions.addEventListener("TargetSelectionStarts", true, (val) => {
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
            target &&
            target.getHealth() <= 0 &&
            correctParameters &&
            game.graveyard[plr.id].includes(target)
        , "3.js");
    }
}
