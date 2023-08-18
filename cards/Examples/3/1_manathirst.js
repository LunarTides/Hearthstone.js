// Created by Hand

/**
 * @type {import("../../../src/types").Blueprint}
 */
module.exports = {
    name: "Manathirst Example",
    stats: [1, 2],
    desc: "Battlecry: Freeze an enemy minion. Manathirst (6): Silence it first.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    /**
     * @type {import("../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        // self.manathirst(mana_to_check, first_prompt, second_prompt)
        // If the plr has `mana_to_check` or more mana, `ret` will be true, and `prompt` will be `first_prompt`. If the plr has less than `mana_to_check`, `ret` will be false, and `prompt` will be `second_prompt`.
        let [ret, prompt] = self.manathirst(6, "Silence then freeze an enemy minion.", "Freeze an enemy minion.");

        // Select a target to freeze (and silence)
        // The first argument is the prompt to ask the user.
        // The second argument is this card (aka `self`).
        // The third argument is the alignment of the target the user is restrictted to. If this is "enemy", the user can only select enemy targets, if this is "friendly", the user can only select friendly targets, if this is null, the user can select any target.
        // The fourth argument is the type of target. If this is "minion", the user can only select minions, if this is "hero", the user can only select heroes, if this is null, the user can select minions AND heroes.
        // The third and fourth argument works together.
        //
        // Ask the user to select a target based on the `prompt`, the user can only select enemy minions
        let target = game.interact.selectTarget(prompt, self, "enemy", "minion");
        if (!target) return game.constants.REFUND; // The user cancelled their selection, if you return this, the game refunds the card.

        if (ret) target.silence(); // If the manathirst was successful, silence the target first
        target.freeze(); // Freeze the target
    },

    condition(plr, game, self) { // This is optional
        // Since we didn't put the `conditioned: ["battlecry"]` at the top, it won't cancel the battlecry if this returns false, this is just to warn the user that the manathirst isn't triggered.
        return self.manathirst(6); // If you don't specify `first_prompt` and `second_prompt`, this just returns the result.
    }
}
